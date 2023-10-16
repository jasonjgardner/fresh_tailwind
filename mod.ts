import type { Plugin } from "$fresh/server.ts";
import type {
  AcceptedPlugin,
  ProcessOptions,
  Result,
} from "postcss/lib/postcss.js";
import postcss from "postcss/mod.js";
import autoprefixer from "autoprefixer";
import tailwind from "tailwindcss";

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
  { plugins = [], postcssOptions, tailwindContent, css }: TailwindOptions,
): Promise<Result> {
  const postcssPlugins: AcceptedPlugin[] = [
    // TODO: Pass build target to autoprefixer
    autoprefixer(),

    // @ts-ignore - Tailwind types not setup
    tailwind({
      // TODO: Provide config settings from tailwind.config.ts
      content: tailwindContent ?? [
        "./routes/**/*.{tsx,jsx,ts,js}",
        "./islands/**/*.{tsx,jsx,ts,js}",
        "./components/**/*.{tsx,jsx,ts,js}",
      ],
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
 * Fresh plugin which processes Tailwind CSS.
 * @param options - {@link TailwindOptions}
 * @returns Fresh Tailwind plugin
 */
export default function tailwindPlugin(
  options: TailwindOptions = {},
): Plugin {
  return {
    name: "tailwind_plugin",
    async renderAsync(ctx) {
      const res = await ctx.renderAsync();
      options.tailwindContent = [{
        raw: res.htmlText,
        extension: ".html",
      }, ...(options.tailwindContent ?? [])];

      const { css } = await processTailwind(options);
      const styles = [{
        id: STYLE_ELEMENT_ID,
        cssText: css,
      }];

      // TODO: Allow injecting fonts

      return {
        styles,
      };
    },
  };
}
