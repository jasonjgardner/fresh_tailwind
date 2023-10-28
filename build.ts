import type { Plugin } from "./deps.ts";
import {
  DEFAULT_STATIC_DIR,
  DEFAULT_STYLE_NAME,
  DEFAULT_TAILWIND_CONFIG,
} from "./constants.ts";

export interface TailwindPluginOptions {
  /**
   * The destination of the generated CSS _file_.
   */
  dest?: string;
  /**
   * The location of the Tailwind CLI binary. Defaults to `./bin/tailwindcss`.
   */
  binLocation?: string;
}

/**
 * Fresh plugin which processes Tailwind CSS.
 * @param options - {@link TailwindOptions}
 * @returns Fresh Tailwind plugin
 */
export default function tailwindBuildPlugin(options: TailwindPluginOptions = {
  dest: "style.css",
  binLocation: "./bin/tailwindcss",
}) {
  const fileName = options?.dest ?? DEFAULT_STYLE_NAME;
  const plugin: Plugin = {
    name: "tailwind_build_plugin",
    buildStart: async () => {
      // FIXME: Fresh v1.5.2 doesn't support buildStart config yet
      const config = {
        staticDir: DEFAULT_STATIC_DIR,
        dev: true,
      };
      const tailwindBin = options.binLocation ?? "./bin/tailwindcss";

      const tailwindCmd = new Deno.Command(tailwindBin, {
        args: [
          "-o",
          `${config?.staticDir ?? DEFAULT_STATIC_DIR}/${fileName}`,
          "--config",
          `${Deno.cwd()}/${DEFAULT_TAILWIND_CONFIG}`,
          !config?.dev ? "--minify" : "",
        ],
      });

      await tailwindCmd.output();
    },
  };

  return plugin;
}
