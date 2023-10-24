import { toFileUrl } from "./deps.ts";

/**
 * Attempt to import a Tailwind configuration file.
 * If no file is provided, it will attempt to import the default config file names.
 * @param configFile Optional file path to the Tailwind config file.
 * @returns Imported configuration file
 * @throws {Error} If the config file is not found
 * @example
 * ```ts
 * const config = await tryImportConfig("./tailwind.config.ts");
 * ```
 */
export async function tryImportConfig(
  configFile?: string,
) {
  const scripts = [toFileUrl(`${Deno.cwd()}/tailwind.config.ts`).href];
  scripts[1] = scripts[0].replace(/\.ts$/, ".js");
  scripts[2] = scripts[0].replace(/\.ts$/, ".mjs");

  for (const script of scripts) {
    try {
      const config = await import(
        configFile ?? script
      );

      return config.default;
    } catch (err) {
      if (
        !(err instanceof Deno.errors.NotFound) && !(err instanceof TypeError)
      ) {
        throw err;
      }
    }
  }
}

/**
 * Load Tailwind configuration from a file. Return a default configuration if no file is provided.
 * @param configFile __Absolute__ path to the Tailwind config file.
 * @returns Tailwind configuration
 * @throws {Error} If the config file is not found
 * @example
 * ```ts
 * const config = await getConfig("./tailwind.config.ts");
 * ```
 * @uses {@link tryImportConfig}
 */
export async function getConfig(
  configFile?: string,
) {
  const defaultConfig = {
    content: [
      "./routes/**/*.{tsx,jsx,ts,js}",
      "./islands/**/*.{tsx,jsx,ts,js}",
      "./components/**/*.{tsx,jsx,ts,js",
      "./src/**/*.css",
    ],
    theme: { extend: {} },
    plugins: [],
  };

  try {
    const config = await tryImportConfig(configFile);

    return {
      ...defaultConfig,
      ...config,
    };
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound) && !(err instanceof TypeError)) {
      throw err;
    }
    console.warn(
      "Unable to load Tailwind config file, using defaults.",
    );
    return defaultConfig;
  }
}
