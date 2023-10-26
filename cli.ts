#!/usr/bin/env -S deno run --allow-sys=osRelease --allow-net=github.com,objects.githubusercontent.com --allow-read=./ --allow-write=./
import { JSONC } from "$fresh/src/server/deps.ts";
import { existsSync } from "$std/fs/mod.ts";
import { ensureDir, join } from "./deps.ts";

// Download standalone Tailwind CLI from GitHub releases.
// Get the users OS and architecture.
// Attempt to download the appropriate binary.
// Compare it to the checksums.

const TAILWIND_VERSION = "3.3.3";
const TAILWIND_REPO =
  `https://github.com/tailwindlabs/tailwindcss/releases/download/v${TAILWIND_VERSION}`;

/**
 * Attempt to download the Tailwind CLI binary from GitHub releases for the current OS and architecture.
 * Requires several permsissions:
 * - read access to the working directory
 * - write access to the working directory
 * - network access to GitHub and GitHub user content
 * - System OS information
 * @param root Project root directory. Defaults to the current working directory.
 * @returns Path to Tailwind CLI executable
 * @throws {Error} If the checksums do not match
 */
async function download(root?: string, dest = "./bin"): Promise<string> {
  if (!root) {
    console.info(
      "A root directory has not been defined. Attempting to use the current working directory.",
    );
  }

  const allowRead = await Deno.permissions.query({
    name: "read",
    path: root ?? "./",
  });

  if (allowRead.state !== "granted") {
    console.log(
      `Please allow read access to ${
        root ?? "the current working directory"
      } to download Tailwind CSS files.`,
    );
  }

  const requestRead = await Deno.permissions.request({
    name: "read",
    path: root ?? "./",
  });

  if (requestRead.state !== "granted") {
    throw new Error(
      `Please allow read access to ${
        root ?? "the current working directory"
      } to download Tailwind CSS files.`,
    );
  }

  const cwd = root ?? Deno.cwd();
  const checksums: Record<string, string> = {};

  const allowNet = await Deno.permissions.query({
    name: "net",
    host: "github.com",
  });

  if (allowNet.state !== "granted") {
    console.log(
      `Please allow network access to GitHub (and asset download redirects) to download Tailwind CSS files from the following URL: ${TAILWIND_REPO}`,
    );
  }

  const requestNet = await Deno.permissions.request({
    name: "net",
    host: "github.com",
  });

  const requestNetContent = await Deno.permissions.request({
    name: "net",
    host: "objects.githubusercontent.com",
  });

  if (requestNet.state !== "granted" || requestNetContent.state !== "granted") {
    throw new Error(
      "Please allow network access to GitHub and GitHub user content to download Tailwind CSS files.",
    );
  }

  console.log(`Fetching Tailwind CSS v${TAILWIND_VERSION} checksums...`);
  const res = await fetch(`${TAILWIND_REPO}/sha256sums.txt`);

  // Convert the result to the checksums object.
  // Then convert the Deno OS and architecture to the appropriate binary name and checksum.
  // Finally, compare the checksums.

  const text = await res.text();
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  for (const line of lines) {
    const [checksum, filename] = line.split(/\s+/);
    checksums[filename.replace(".exe", "")] = checksum;
  }

  // Deno OS and architecture names are different than the ones used by Tailwind.
  // Convert them to Tailwind's names.

  const osMap: Record<string, string> = {
    darwin: "macos",
    linux: "linux",
    windows: "windows",
  };
  const archMap: Record<string, string> = {
    x64: "x64",
    arm64: "arm64",
    arm: "armv7",
  };
  const tailwindOs = osMap[Deno.build.os];
  const tailwindArch = archMap[Deno.build.arch] ?? "x64";

  // Get the checksum for the current OS and architecture.
  // If it doesn't exist, throw an error.

  const checksum = checksums[`tailwindcss-${tailwindOs}-${tailwindArch}`];
  if (!checksum) {
    throw new Error(`Checksum not found for ${tailwindOs}-${tailwindArch}`);
  }

  const exeExtension = Deno.build.os === "windows" ? ".exe" : "";

  // Download the binary from GitHub releases.
  // Compare the checksums.
  // If they don't match, throw an error.

  console.log(
    `Downloading Tailwind CSS v${TAILWIND_VERSION} for ${Deno.build.os}-${Deno.build.arch}...`,
  );
  const dl = await fetch(
    `${TAILWIND_REPO}/tailwindcss-${tailwindOs}-${tailwindArch}${exeExtension}`,
  );
  const data = await dl.arrayBuffer();
  // Compare binary download to checksum before writing to disk

  const actualChecksum = await crypto.subtle.digest("SHA-256", data);

  // Compare array buffer checksum to string checksum
  if (
    checksum !== [...new Uint8Array(actualChecksum)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  ) {
    throw new Error("Checksums do not match!");
  }

  const binDest = join(cwd, dest);
  const allowWrite = await Deno.permissions.query({ name: "write", path: cwd });

  if (allowWrite.state !== "granted") {
    console.log(
      `Please allow write access to ${cwd} to download Tailwind CSS files.`,
    );
  }

  const requestWrite = await Deno.permissions.request({
    name: "write",
    path: cwd,
  });

  if (requestWrite.state !== "granted") {
    throw new Error(
      `Please allow write access to ${cwd} to download Tailwind CSS files.\n\nYou can also download the Tailwind CSS binary manually from ${TAILWIND_REPO} and place it in ${binDest}`,
    );
  }

  // Write the binary to disk.
  // Make it executable.
  // Add it to the current working directory's "bin" directory.
  // Make the bin directory if it doesn't exist.
  await ensureDir(binDest);

  const executable = join(binDest, `tailwindcss${exeExtension}`);

  await Deno.writeFile(
    executable,
    new Uint8Array(data),
  );

  console.log(
    `Successfully downloaded %cTailwind CLI %c v${TAILWIND_VERSION} %c for %c${tailwindOs}-${tailwindArch}`,
    "color: cyan;",
    "background-color:cyan;color:black;",
    "",
    "color: yellow; padding: 0.1em;",
  );

  return executable;
}

/** Reads and parses deno.json or deno.jsonc whichever found first. Returns both the parsed content
 * and the path to actual file discovered.
 */
async function readDenoJson(resolvedDirectory: string) {
  try {
    const j = join(resolvedDirectory, "deno.json");
    if (existsSync(j)) {
      const denoJson = JSON.parse(await Deno.readTextFile(j));
      return { denoJson: denoJson, denoJsonPath: j };
    }
    const jc = join(resolvedDirectory, "deno.jsonc");
    if (existsSync(jc)) {
      const denoJson = JSONC.parse(await Deno.readTextFile(jc));
      return { denoJson: denoJson, denoJsonPath: jc };
    }
    throw new Error(
      `Neither deno.json nor deno.jsonc could be found in ${resolvedDirectory}`,
    );
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      throw new Error(
        `Neither deno.json nor deno.jsonc could be found in ${resolvedDirectory}`,
      );
    }
    throw err;
  }
}

/**
 * Add Tailwind CLI commands to Deno tasks.
 * @param cwd - Current working directory for Deno project. Defaults to `"./"` if undefined.
 */
export async function addTask(cwd?: string) {
  // Add task to deno.json[c]
  try {
    const { denoJson, denoJsonPath } = await readDenoJson(cwd ?? "./");

    denoJson.tasks.tailwind = "./bin/tailwindcss";

    if (!denoJson.tasks["tailwind:build"]) {
      denoJson.tasks["tailwind:build"] =
        "./bin/tailwindcss -i ./src/style.css -o ./static/style.css --config ./tailwind.config.ts --minify";
    }

    if (!denoJson.tasks["tailwind:watch"]) {
      denoJson.tasks["tailwind:watch"] =
        "./bin/tailwindcss -i ./src/style.css -o ./static/style.css --config ./tailwind.config.ts --watch";
    }

    await Deno.writeTextFile(denoJsonPath, JSON.stringify(denoJson, null, 2));
  } catch (err) {
    throw err;
  }

  console.log(
    "Tailwind CLI commands have been added to your Deno tasks. Run %cdeno task tailwind%c... for Tailwind CLI commands.",
    "color:teal;",
    "",
  );
}

export async function writeTailwindConfig() {
  try {
    await Deno.readTextFile("./tailwind.config.ts");
    return;
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound) && !(err instanceof TypeError)) {
      throw err;
    }
  }

  const content = `export default {
  content: [
    "./routes/**/*.{ts,tsx}",
    "./islands/**/*.tsx",
    "./components/**/*.tsx",
  ],
};`;

  await Deno.writeTextFile("./tailwind.config.ts", content);

  try {
    await Deno.readTextFile("./src/styles.css");
    return;
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound) && !(err instanceof TypeError)) {
      throw err;
    }
  }

  const styles = `@tailwind base;
  @tailwind components;
  @tailwind utilities;`;

  await ensureDir("./src");
  await Deno.writeTextFile("./src/styles.css", styles);
}

export default async function init(root?: string, updateTasks = true) {
  // Check if deno.json[c] has a tasks.tailwind property before attempting to download.
  // If it does, skip downloading.

  try {
    const { denoJson, denoJsonPath: _denoJsonPath } = await readDenoJson(
      root ?? "./",
    );

    if (denoJson.tasks.tailwind) {
      console.log(
        "Tailwind CLI commands have already been added to your Deno tasks. Run %cdeno task tailwind%c... for Tailwind CLI commands.",
        "color:teal;",
        "",
      );
      return denoJson.tasks.tailwind;
    }
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound) && !(err instanceof TypeError)) {
      throw err;
    }
  }

  const executable = await download(root);

  if (updateTasks) {
    await Promise.all([addTask(root), writeTailwindConfig()]);
  }
  return executable;
}

if (import.meta.main) {
  try {
    // Read is required for execPath
    const allowRead = await Deno.permissions.query({
      name: "read",
    });

    if (allowRead.state !== "granted") {
      console.warn(
        "Please allow read access to the current working directory to run Tailwind CSS.",
      );
    }

    const cmd = new Deno.Command(Deno.execPath(), {
      args: [
        "task",
        "tailwind",
        ...Deno.args.slice(1),
      ],
    });

    const { stdout } = await cmd.output();

    const decoder = new TextDecoder();
    const text = decoder.decode(stdout);

    console.log(text);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound) && !(err instanceof TypeError)) {
      console.error(err);
      await init(Deno.args[0] ?? Deno.cwd(), Deno.args[1] !== "--no-tasks");
      console.log(
        "Run %cdeno task tailwind%c... for Tailwind CLI commands.",
        "color:teal;",
        "",
      );
    }

    throw err;
  }
}
