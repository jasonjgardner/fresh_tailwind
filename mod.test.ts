import {
  assertEquals,
  assertNotEquals,
  assertStringIncludes,
} from "$std/assert/mod.ts";
import tailwindPlugin, { STYLE_ELEMENT_ID } from "./mod.ts";

Deno.test("Test PostCSS/Tailwind with render hook", async function processTailwindTest() {
  const plugin = tailwindPlugin({
    css: `.test {
      @apply text-red-500;
    }`,
    hookRender: true,
  });

  assertNotEquals(plugin, undefined);

  if (!plugin) {
    throw new Error("Plugin is undefined");
  }

  assertNotEquals(plugin.renderAsync, undefined);

  const ctx = {
    renderAsync: () => {
      return {
        htmlText: '<div class="test">Howdy</div>',
        requiresHydration: false,
      };
    },
  };
  const res = await plugin.renderAsync!(ctx);

  if (!res) {
    throw new Error("Plugin result is undefined");
  }

  assertNotEquals(res.styles, []);
  assertEquals(res.styles?.length, 1);
  assertEquals(res.styles?.[0].id, STYLE_ELEMENT_ID);
  assertNotEquals(res.styles?.[0].cssText, "");
  assertStringIncludes(res.styles?.[0].cssText ?? "", ".test");
  assertStringIncludes(res.styles?.[0].cssText ?? "", "color:");
  assertStringIncludes(res.styles?.[0].cssText ?? "", "--tw-text-opacity");
});

Deno.test("Test PostCSS/Tailwind with build step", async function buildTailwindTest() {
  const plugin = tailwindPlugin({
    css: `.test {
      @apply text-green-500;
    }`,
    hookRender: false,
    staticDir: "./test",
    dest: "./test/style.css",
  });

  assertNotEquals(plugin, undefined);

  if (!plugin) {
    throw new Error("Plugin is undefined");
  }

  await plugin.buildStart?.();

  const css = await Deno.readTextFile("./test/style.css");

  assertNotEquals(css, "");
  assertStringIncludes(css, ".test");
  assertStringIncludes(css, "color:");
  assertStringIncludes(css, "--tw-text-opacity");
});
