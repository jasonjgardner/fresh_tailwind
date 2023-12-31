import type {
  AcceptedPlugin,
  ProcessOptions,
  Result,
} from "https://deno.land/x/postcss@8.4.16/lib/postcss.js";
import postcss from "https://deno.land/x/postcss@8.4.16/mod.js";
export { type Config, default as tailwindcss } from "npm:tailwindcss@3.3.5";

export type { AcceptedPlugin, ProcessOptions, Result };

export { postcss };
export {
  basename,
  join,
  toFileUrl,
} from "https://deno.land/std@0.204.0/path/mod.ts";
export { ensureDir } from "https://deno.land/std@0.204.0/fs/mod.ts";
export * as JSONC from "https://deno.land/std@0.204.0/jsonc/mod.ts";
export { encodeHex } from "https://deno.land/std@0.204.0/encoding/hex.ts";
export { type Plugin } from "https://deno.land/x/fresh@1.5.2/server.ts";
