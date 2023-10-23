import type { Plugin } from "$fresh/server.ts";
import { join } from "$std/path/mod.ts";

export interface TailwindPluginOptions {
  dest?: string;
}

/**
 * Fresh plugin which processes Tailwind CSS.
 * @param options - {@link TailwindOptions}
 * @returns Fresh Tailwind plugin
 */
export default function tailwindBuildPlugin(options?: TailwindPluginOptions) {
  const fileName = options?.dest ?? "style.css";
  const plugin: Plugin = {
    name: "tailwind_plugin",
    buildStart: async (config) => {
      const tailwindBin =
        JSON.parse(await Deno.readTextFile(join(Deno.cwd(), "deno.json")))
          ?.tasks
          ?.tailwind ?? "./bin/tailwindcss";

      const tailwindCmd = new Deno.Command(tailwindBin, {
        args: [
          "-o",
          `${config?.build?.outDir ?? config.staticDir}/${fileName}`,
          "--config",
          `${Deno.cwd()}/tailwind.config.ts`,
          !config.dev ? "--minify" : "",
        ],
      });

      await tailwindCmd.output();
    },
  };

  return plugin;
}
