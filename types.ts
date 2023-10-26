import type { Plugin } from "$fresh/server.ts";
import type { AcceptedPlugin, ProcessOptions } from "./deps.ts";

export interface TailwindPlugin extends Plugin {
  install: () => Promise<Plugin>;
  build: () => Promise<void>;
}

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
   * Additional options to pass onto PostCSS.
   */
  postcssOptions?: ProcessOptions;
  /**
   * List of paths to files that should be scanned for classes.
   * Defaults to check routes, islands and components.
   */
  tailwindContent?: Array<string | { raw: string; extension: string }>;

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
   * The Tailwind configuration file path.
   */
  configFile?: string;
}
