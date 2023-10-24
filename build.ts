import type { Plugin } from "$fresh/server.ts";
import { join } from "./deps.ts";

export interface TailwindPluginOptions {
  dest?: string;
}

/**
 * Fresh plugin which processes Tailwind CSS.
 * @param options - {@link TailwindOptions}
 * @returns Fresh Tailwind plugin
 */
export default function tailwindBuildPlugin(options?: TailwindPluginOptions) {
  const fileName = options?.dest ?? "styles.css";
  const plugin: Plugin = {
    name: "tailwind_build_plugin",
    buildStart: async (config) => {
      const tailwindBin =
        JSON.parse(await Deno.readTextFile(join(Deno.cwd(), "deno.json")))
          ?.tasks
          ?.tailwind ?? "./bin/tailwindcss";

      const tailwindCmd = new Deno.Command(tailwindBin, {
        args: [
          "-o",
          `${config?.staticDir ?? "./static"}/${fileName}`,
          "--config",
          `${Deno.cwd()}/tailwind.config.ts`,
          !config?.dev ? "--minify" : "",
        ],
      });

      await tailwindCmd.output();
    },
  };

  return plugin;
}
