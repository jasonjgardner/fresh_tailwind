import { assertNotEquals, assertStringIncludes } from "$std/assert/mod.ts";
import tailwindPlugin from "./mod.ts";

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
  // assertEquals(res.styles?.length, 1);
  // assertEquals(res.styles?.[0].id, STYLE_ELEMENT_ID);
  // assertNotEquals(res.styles?.[0].cssText, "");
  // assertStringIncludes(res.styles?.[0].cssText ?? "", ".bg-red-500");
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

  const css = await Deno.readTextFile("./test/style.css");
  assertStringIncludes(
    css,
    `/*
! tailwindcss v3.3.5`,
  );
  assertStringIncludes(css, "--tw-text-opacity");
});
