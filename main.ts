import tailwindPlugin from "./mod.ts";
/**
 * @example Run Tailwind installation from command line.
 * ```
 * deno run -A https://deno.land/x/fresh_tailwind/main.ts --install
 * ```
 *
 * @example Run Tailwind build from command line.
 * ```
 * deno run -A https://deno.land/x/fresh_tailwind/main.ts
 * ```
 */
async function run() {
  const tailwind = tailwindPlugin();

  if (Deno.args.includes("--install")) {
    await tailwind.install();
    return;
  }

  await tailwind.build();
}

if (import.meta.main) {
  await run();
}
