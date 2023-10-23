import type {
  AcceptedPlugin,
  ProcessOptions,
  Result,
} from "https://deno.land/x/postcss@8.4.16/lib/postcss.js";
import postcss from "https://deno.land/x/postcss@8.4.16/mod.js";
export { default as autoprefixer } from "https://esm.sh/autoprefixer@10.4.16";
export { type Config, default as tailwindcss } from "npm:tailwindcss@3.3.3";

export type { AcceptedPlugin, ProcessOptions, Result };

export { postcss };

export { basename, join } from "$std/path/mod.ts";
export { ensureDir } from "$std/fs/mod.ts";
