import {
  assertEquals,
  assertNotEquals,
  assertStringIncludes,
} from "$std/assert/mod.ts";
import tailwindPlugin, { processPostCSS, processTailwind } from "./mod.ts";
import { getConfig } from "./_tailwind.ts";

import { TAILWIND_PREFLIGHT, TAILWIND_VERSION } from "./constants.ts";

Deno.test("processPostCSS should return transformed CSS", async () => {
  const pfm = await import("https://esm.sh/postcss-font-magician");
  const result = await processPostCSS({
    css: "./test/test.css",
    plugins: [
      pfm.default({
        variants: {
          "Roboto": {
            "300": [],
            "400": [],
            "700": [],
          },
        },
        foundries: ["google"],
      }),
    ],
  });

  assertStringIncludes(result.css, "@font-face {");
});

Deno.test("processTailwind should return default Tailwind CSS", async () => {
  const result = await processTailwind({
    css: TAILWIND_PREFLIGHT,
    tailwindContent: [{
      raw: '<html><body><div class="bg-red-500">Howdy</div></body></html>',
      extension: ".html",
    }],
  });

  assertStringIncludes(
    result.css,
    `/*
! tailwindcss v3.3.5 | MIT License | https://tailwindcss.com`,
  );
  assertStringIncludes(result.css, "--tw-");
  assertStringIncludes(result.css, ".bg-red-500");
});

Deno.test("should return default config when no configFile is provided", async () => {
  const config = await getConfig();

  assertEquals(config, {
    content: [
      "./routes/**/*.{tsx,jsx,ts,js}",
      "./islands/**/*.{tsx,jsx,ts,js}",
      "./components/**/*.{tsx,jsx,ts,js",
      "./src/**/*.css",
    ],
    theme: { extend: {} },
    plugins: [],
  });
});

Deno.test("should matching config when config is provided", async () => {
  const config = await getConfig("./test/_tailwind.config.ts");
  const testConfig = (await import("./test/_tailwind.config.ts")).default;

  assertEquals(config, testConfig);
});

Deno.test("Test PostCSS/Tailwind with render hook", async function processTailwindTest() {
  const plugin = tailwindPlugin();

  const ctx = {
    renderAsync: () =>
      Promise.resolve({
        htmlText: '<div class="bg-red-500">Howdy</div>',
        requiresHydration: false,
      }),
  };
  const res = await plugin.renderAsync!(ctx);

  if (!res) {
    throw new Error("Plugin result is undefined");
  }

  assertNotEquals(res.styles, []);
  assertEquals(res.styles?.length, 1);
  // assertEquals(res.styles?.[0].id, STYLE_ELEMENT_ID);
  assertNotEquals(res.styles?.[0].cssText, "");
  assertStringIncludes(res.styles?.[0].cssText ?? "", ".bg-red-500");
});

Deno.test("Test PostCSS/Tailwind with build step", async function buildTailwindTest() {
  const plugin = tailwindPlugin({
    dest: "./test/style.css",
  });

  assertNotEquals(plugin, undefined);

  if (!plugin) {
    throw new Error("Plugin is undefined");
  }

  await plugin.buildStart!();

  // Ensure that the file was created
  const css = await Deno.readTextFile("./test/style.css");
  assertStringIncludes(
    css,
    `/*
! tailwindcss v${TAILWIND_VERSION} | MIT License | https://tailwindcss.com`,
  );
});
