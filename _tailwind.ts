import { toFileUrl } from "$std/path/to_file_url.ts";
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
    ],
    theme: { extend: {} },
    plugins: [],
  };

  try {
    const config = (await import(
      configFile ?? toFileUrl(`${Deno.cwd()}/tailwind.config.ts`).href
    )).default;

    return {
      ...defaultConfig,
      ...config,
    };
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    console.warn(
      "Unable to load Tailwind config file, using defaults.",
    );
    return defaultConfig;
  }
}
