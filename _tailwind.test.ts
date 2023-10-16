import { assertEquals } from "$std/assert/mod.ts";
import { getConfig } from "./_tailwind.ts";

Deno.test("Test get .ts config file", async function getTypescriptTailwindConfig() {
  const config = await getConfig("./test/tailwind.config.ts");
  const keys = Object.keys(config);

  assertEquals(keys.length, 3);
  assertEquals(keys.includes("content"), true);
  assertEquals(keys.includes("theme"), true);
  assertEquals(keys.includes("plugins"), true);
});
