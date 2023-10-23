import tailwindPlugin from "./mod.ts";
import { join } from "$std/path/mod.ts";

const css = await Deno.readTextFile(join(Deno.cwd(), "src", "style.css"));

const tailwind = tailwindPlugin({
  css,
  dest: "./static/styles.css",
});

if (import.meta.main) {
  await tailwind.build();
}
