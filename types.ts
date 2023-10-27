import type { AcceptedPlugin, Plugin, ProcessOptions } from "./deps.ts";

/**
 * Fresh Tailwind plugin settings.
 */
export interface TailwindOptions {
  /**
   * The CSS source file path or contents as string to process.
   */
  css?: string;
  /**
   * The destination of the generated CSS file.
   * Should include file name. Defaults to `./static/style.css`.
   */
  dest?: string;
  /**
   * List of PostCSS plugins to use.
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
   * The Fresh static content directory path.
   * Defaults to `./static`.
   */
  staticDir?: string;
  /**
   * The Tailwind configuration file path.
   */
  configFile?: string;
  /**
   * The ID of the style element that is injected into the HTML.
   * Should be unique to avoid conflicts with other plugins.
   */
  styleElementId?: string;
}

// TODO: Export from Fresh package once available
export interface ResolvedFreshConfig {
  dev: boolean;
  build: {
    outDir: string;
    target: string | string[];
  };
  plugins: Plugin[];
  staticDir: string;
  server: Partial<Deno.ServeTlsOptions>;
}
