import type {
  Plugin,
  PluginAsyncRenderContext,
  PluginRenderResult,
} from "$fresh/server.ts";
import { asset, IS_BROWSER } from "$fresh/runtime.ts";
import {
  type AcceptedPlugin,
  encodeHex,
  ensureDir,
  postcss,
  type Result,
  tailwindcss as tailwind,
} from "./deps.ts";
import { getConfig } from "./_tailwind.ts";
import type { ResolvedFreshConfig, TailwindOptions } from "./types.ts";
import {
  DEFAULT_STATIC_DIR,
  DEFAULT_STYLE_DEST,
  DEFAULT_STYLE_NAME,
  TAILWIND_PREFLIGHT,
} from "./constants.ts";

/**
 * The ID of the style element that is injected into the HTML.
 */
export const STYLE_ELEMENT_ID = "__FRSH_TAILWIND";

/**
 * Process CSS using PostCSS.
 */
export async function processPostCSS(
  { plugins = [], postcssOptions, css, dest }: TailwindOptions,
): Promise<Result> {
  const postcssPlugins: AcceptedPlugin[] = [
    ...plugins,
  ];

  // Assume that if the CSS starts with "./" or "/", it's a file path
  const isFile = css?.startsWith("./") || css?.startsWith("/");

  // Read the CSS file if it's a file path, otherwise use the CSS string.
  const stylesheet = (isFile && css) ? await Deno.readTextFile(css) : css ?? "";

  // Process the stylesheet using PostCSS and return the new CSS and map.
  const processed = await postcss(postcssPlugins).process(
    stylesheet,
    {
      from: isFile ? css : undefined,
      to: dest,
      ...postcssOptions,
    },
  );

  return processed;
}

/**
 * Process Tailwind CSS using PostCSS.
 * @param options - {@link TailwindOptions}
 * @returns PostCSS result
 */
export async function processTailwind(
  {
    plugins = [],
    postcssOptions,
    css,
    tailwindContent,
    configFile,
    dest,
    staticDir,
  }: TailwindOptions,
): Promise<Result> {
  const config = await getConfig(configFile);
  const tailwindPlugins: AcceptedPlugin[] = [
    tailwind({
      ...config,
      content: tailwindContent ?? config.content,
    }) as AcceptedPlugin,
    ...plugins,
  ];

  return processPostCSS({
    plugins: tailwindPlugins,
    postcssOptions,
    css: css ?? TAILWIND_PREFLIGHT,
    dest,
    staticDir,
  });
}

/**
 * Process Tailwind CSS and return its styles for Fresh.
 * @param options - {@link TailwindOptions}
 * @returns Plugin render result with injected Tailwind styles
 */
async function renderTailwind(
  options: TailwindOptions,
  id: string = STYLE_ELEMENT_ID,
): Promise<PluginRenderResult> {
  if (IS_BROWSER) {
    return {
      styles: [],
    };
  }

  const staticDir = options.staticDir ?? DEFAULT_STATIC_DIR;
  const hasDestination = options.dest !== undefined &&
    options.dest.includes(staticDir);

  const { css, map } = await processTailwind(options);
  const inlineMap = options.postcssOptions?.map
    ? `/*# sourceMappingURL=data:application/json;base64,${
      btoa(JSON.stringify(map?.toJSON() ?? {}))
    } */`
    : "";

  // Prepare style output. Use an import if a destination is provided.
  const styles = [{
    id,
    cssText: hasDestination
      ? `@import url("${
        asset(
          options.dest?.replace(
            staticDir, // Make asset URL relative to static dir
            "",
          ) ?? `./${DEFAULT_STYLE_NAME}`,
        )
      }")\n${inlineMap}`
      : `${css}\n${inlineMap}`,
  }];

  try {
    // Attempt to write styles to file when a destination is provided
    if (hasDestination) {
      await Deno.writeTextFile(options.dest as string, css);
    }
  } catch (err) {
    console.warn("Failed to write Tailwind CSS to file.\n%s", err);
    // Fallback to including styles in HTML
    styles[0].cssText = `${css}\n${inlineMap}`;
  }

  try {
    // Attempt to write map to file when a destination is provided
    if (hasDestination) {
      await Deno.writeTextFile(`${options.dest}.map`, map.toString());
    }
  } catch (err) {
    console.warn("Failed to write Tailwind CSS map to file.\n%s", err);
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
  options: TailwindOptions = {},
): Plugin {
  return {
    name: "tailwind_plugin",
    /**
     * Return an import to the pre-compiled Tailwind CSS file.
     */
    render(ctx) {
      ctx.render();
      if (!options.dest) {
        return {
          styles: [],
        };
      }

      const src = options.dest.replace(
        options.staticDir ?? DEFAULT_STATIC_DIR, // Make asset URL relative to static dir
        "",
      );

      return {
        styles: [{
          id: options.styleElementId ??
            `${STYLE_ELEMENT_ID}_${encodeHex(src).substring(0, 6)}`,
          cssText: `@import url("${asset(src)}")`,
        }],
      };
    },
    /**
     * Process Tailwind CSS and inject it into the HTML.
     * Will not process Tailwind CSS if a destination is provided.
     */
    async renderAsync(
      ctx: PluginAsyncRenderContext,
    ) {
      const res = await ctx.renderAsync();

      if (options.dest) {
        return {
          styles: [],
        };
      }

      const id = options.styleElementId ?? encodeHex(
        options.css
          ? options.css
          : res.htmlText.lastIndexOf(`${STYLE_ELEMENT_ID}_PARTIAL_`).toString(),
      ).substring(0, 10);

      return await renderTailwind(
        {
          ...options,
          tailwindContent: [{
            raw: res.htmlText,
            extension: ".html",
          }],
        },
        options.styleElementId ?? `${STYLE_ELEMENT_ID}_PARTIAL_${id}`,
      );
    },
    /**
     * Output Tailwind CSS to file on Fresh build command.
     * @param config Fresh configuration
     */
    buildStart: async (config?: ResolvedFreshConfig) => {
      if (!options.dest) {
        return;
      }

      const { css } = await processTailwind({
        dest: options.dest ??
          `${
            config?.build?.outDir ?? config?.staticDir ?? DEFAULT_STATIC_DIR
          }/${DEFAULT_STYLE_NAME}`,
        ...options,
      });

      if (css === undefined || css === "") {
        console.warn("Failed to process Tailwind CSS.");
        return;
      }

      const dest = options?.dest ?? DEFAULT_STYLE_DEST;
      await ensureDir(dest.split("/").slice(0, -1).join("/"));
      await Deno.writeTextFile(dest, css);
    },
  };
}
