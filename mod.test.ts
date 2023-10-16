import {
  assertEquals,
  assertNotEquals,
  assertStringIncludes,
} from "$std/assert/mod.ts";
import tailwindPlugin, { STYLE_ELEMENT_ID } from "./mod.ts";

Deno.test(async function processTailwindTest() {
  const plugin = tailwindPlugin({
    css: `.test {
      @apply text-red-500;
    }`,
  });

  if (!plugin || !plugin.renderAsync) {
    throw new Error("Plugin is undefined");
  }

  const ctx = {
    renderAsync: () => {
      return {
        htmlText: `<div class="test">Hello world</div>`,
        requiresHydration: false,
      };
    },
  };
  const res = await plugin.renderAsync(ctx);

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
