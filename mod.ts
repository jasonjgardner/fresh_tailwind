import type {
  PluginAsyncRenderContext,
  PluginRenderResult,
} from "$fresh/server.ts";
import { asset, IS_BROWSER } from "$fresh/runtime.ts";
import {
  type AcceptedPlugin,
  autoprefixer,
  ensureDir,
  postcss,
  type Result,
  tailwindcss as tailwind,
} from "./deps.ts";
import { getConfig } from "./_tailwind.ts";
import init from "./cli.ts";
import { ResolvedFreshConfig } from "$fresh/src/server/types.ts";
import type { TailwindOptions, TailwindPlugin } from "./types.ts";

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

  // Prepare style output
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
    // Attempt to write styles to file when a destination is provided
    if (options.dest && options.dest.includes(staticDir)) {
      await Deno.writeTextFile(options.dest, css);
    }
  } catch (err) {
    console.warn("Failed to write Tailwind CSS to file.\n%s", err);
    // Fallback to including styles in HTML
    styles[0].cssText = css;
  }

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
  /**
   * Compile Tailwind CSS and write to file,
   * ensuring the output directory exists.
   * @param opts {@link TailwindOptions}
   * @param conf Fresh configuration
   */
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

  const plugin: TailwindPlugin = {
    name: "tailwind_plugin",
    /**
     * Output Tailwind CSS to file on Fresh build command.
     * @param config Fresh configuration
     */
    buildStart: async (config) => {
      await buildProcess(options, config);
    },
    /**
     * Exposes Tailwind build process as a plugin method.
     * @param opts {@link TailwindOptions}
     * @example
     * ```ts
     * import tailwindPlugin from "fresh_tailwind/mod.ts";
     * const tailwind = tailwindPlugin();
     * await tailwind.build();
     * ```
     */
    async build(opts?: TailwindOptions) {
      await buildProcess(opts ?? options);
    },
    /**
     * Initialize Tailwind standalone CLI download.
     * Use in development and run only as needed.
     * @returns Installation plugin
     * @example
     * ```ts
     * import { defineConfig } from "$fresh/server.ts";
     * import tailwindPlugin from "fresh_tailwind/mod.ts";
     *
     * // Run once to install Tailwind CLI in your development environment.
     * export default defineConfig({
     *  plugins: [ await tailwindPlugin.install() ],
     * });
     * ```
     */
    async install() {
      await init();
      return {
        ...plugin,
        name: "tailwind_installation",
      };
    },
  };

  // Send current HTML to Tailwind for processing
  if (options.hookRender) {
    /**
     * Render Tailwind based on current HTML and configuration content.
     * @param ctx Render context
     * @returns Tailwind styles for use in render function
     */
    plugin.renderAsync = async function renderTailwindStyles(
      ctx: PluginAsyncRenderContext,
    ) {
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
