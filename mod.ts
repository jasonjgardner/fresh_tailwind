import type {
  Plugin,
  PluginAsyncRenderContext,
  PluginRenderResult,
} from "$fresh/server.ts";
import { asset, IS_BROWSER } from "$fresh/runtime.ts";
import type { AcceptedPlugin, ProcessOptions, Result } from "./deps.ts";
import { autoprefixer, postcss, tailwindcss as tailwind } from "./deps.ts";
import { getConfig } from "./_tailwind.ts";
import init from "./cli.ts";
import { ResolvedFreshConfig } from "$fresh/src/server/types.ts";
import { ensureDir } from "$std/fs/ensure_dir.ts";

/**
 * Fresh Tailwind plugin settings.
 */
export interface TailwindOptions {
  css?: string;
  /**
   * List of PostCSS plugins to use.
   * (Already includes Tailwind and Autoprefixer.)
   */
  plugins?: AcceptedPlugin[];
  /**
   * Options to pass onto PostCSS.
   * Include `from` and `to` options to enable source maps.
   */
  postcssOptions?: ProcessOptions;
  /**
   * List of paths to files that should be scanned for classes.
   * Defaults to check routes, islands and components.
   */
  tailwindContent?: Array<string | { raw: string; extension: string }>;
  // TODO: Get from Fresh
  /**
   * The destination of the generated CSS file.
   * Should include file name. Defaults to `./static/style.css`.
   */
  dest?: string;
  /**
   * The Fresh static content directory path.
   * Defaults to `./static`.
   */
  staticDir?: string;
  /**
   * Whether to hook into the render process.
   * Useful during development.
   */
  hookRender?: boolean;

  /**
   * The Tailwind configuration file path.
   */
  configFile?: string;
}

/**
 * The ID of the style element that is injected into the HTML.
 */
export const STYLE_ELEMENT_ID = "__FRSH_TAILWIND";

/**
 * Process Tailwind CSS using PostCSS.
 * @param options - {@link TailwindOptions}
 * @returns PostCSS result
 */
export async function processTailwind(
  { plugins = [], postcssOptions, css, tailwindContent, configFile }:
    TailwindOptions,
): Promise<Result> {
  const config = await getConfig(configFile);

  const postcssPlugins: AcceptedPlugin[] = [
    // TODO: Pass build target to autoprefixer
    autoprefixer(),

    // @ts-ignore - Tailwind types not setup
    tailwind({
      ...config,
      content: tailwindContent ?? config.content,
    }),
    ...plugins,
  ];

  // Assume that if the CSS starts with "./" or "/", it's a file path
  const isFile = css?.startsWith("./") || css?.startsWith("/");

  // Read the CSS file if it's a file path, otherwise use the CSS string.
  // Fallback to default Tailwind CSS.
  const stylesheet = (isFile && css)
    ? await Deno.readTextFile(css)
    : css ?? `@tailwind base;\n@tailwind components;\n@tailwind utilities;`;

  // Process the stylesheet using PostCSS and return the new CSS and map.
  const processed = await postcss(postcssPlugins).process(
    stylesheet,
    {
      from: isFile ? css : undefined,
      ...postcssOptions,
    },
  );

  return processed;
}

/**
 * Process Tailwind CSS and return its styles for Fresh.
 * @param options - {@link TailwindOptions}
 * @returns Plugin render result with injected Tailwind styles
 */
async function renderTailwind(
  options: TailwindOptions,
): Promise<PluginRenderResult> {
  if (IS_BROWSER) {
    return {
      styles: [],
    };
  }

  const { css } = await processTailwind(options);
  const staticDir = options.staticDir ?? "./static";
  const styles = [{
    id: STYLE_ELEMENT_ID,
    cssText: options.dest
      ? `@import url(${
        asset(options.dest.replace(
          staticDir, // Make asset URL relative to static dir
          "",
        ))
      })`
      : css,
  }];

  try {
    if (options.dest && options.dest.includes(staticDir)) {
      await Deno.writeTextFile(options.dest, css);
    }
  } catch (err) {
    console.warn("Failed to write Tailwind CSS to file.\n%s", err);
    styles[0].cssText = css;
  }

  // TODO: Allow injecting fonts

  return {
    styles,
  };
}

/**
 * Fresh plugin which processes Tailwind CSS.
 * @param options - {@link TailwindOptions}
 * @returns Fresh Tailwind plugin
 */
export default function tailwindPlugin(
  options: TailwindOptions = {
    hookRender: false,
  },
) {
  const buildProcess = async (
    opts?: TailwindOptions,
    conf?: ResolvedFreshConfig,
  ) => {
    const { css } = await processTailwind({
      dest: `${conf?.build?.outDir ?? conf?.staticDir ?? "./dist"}/style.css`,
      ...opts,
    });
    const dest = opts?.dest ?? "./static/style.css";
    await ensureDir(dest.split("/").slice(0, -1).join("/"));
    await Deno.writeTextFile(dest, css);
  };

  const plugin: Plugin & {
    init: () => Promise<void>;
    build: () => Promise<void>;
  } = {
    name: "tailwind_plugin",
    buildStart: async (config) => {
      await buildProcess(options, config);
    },
    init,
    build: async (opts?: TailwindOptions) => {
      await buildProcess(opts ?? options);
    },
  };

  // Send current HTML to Tailwind for processing
  if (options.hookRender) {
    plugin.renderAsync = async (ctx: PluginAsyncRenderContext) => {
      const res = await ctx.renderAsync();

      if (!res.requiresHydration) {
        return {
          styles: [],
        };
      }

      options.tailwindContent = [{
        raw: res.htmlText,
        extension: ".html",
      }, ...(options.tailwindContent ?? [])];

      return renderTailwind(options);
    };
  }

  return plugin;
}
