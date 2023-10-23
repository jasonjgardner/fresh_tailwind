import { join, toFileUrl } from "./deps.ts";

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
 * Load Tailwind configuration from a file.
 * @param configFile __Absolute__ path to the Tailwind config file.
 * @returns Tailwind configuration
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
