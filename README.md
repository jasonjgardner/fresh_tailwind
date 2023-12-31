[Fresh has its own Tailwind plugin now.](https://deno.com/blog/fresh-1.6)

# Fresh Tailwind CSS Plugin

Ready, set, copy/paste:

```ts
import { defineConfig } from "$fresh/server.ts";
import tailwindPlugin from "https://deno.land/x/fresh_tailwind/mod.ts";

export default defineConfig({
  plugins: [
    tailwindPlugin(),
  ],
});
```

[![Open CodeSandbox Template](https://img.shields.io/badge/CodeSandbox-151515.svg?style=for-the-badge&logo=CodeSandbox&logoColor=white)](https://codesandbox.io/p/sandbox/fresh-tailwind-hxg9dk "View Fresh + Tailwind starter template")

[Try it on CodeSandbox](https://codesandbox.io/p/sandbox/fresh-tailwind-hxg9dk)
to see a [demo](https://f5j7fl-8000.csb.app/) and example configuration.

[Clone the starter template](https://github.com/jasonjgardner/fresh_tailwind_example)
for a pre-configured Tailwind + Fresh environment.

## Configuration

The following properties are recommended, but not required:

**`css`** - File path to CSS source, or a CSS string, to process.\
**`dest`** - Output file path. **Requires** `deno task build` first!\
**`plugins`** - Array of PostCSS plugins to use during compilation.

See [`./types.ts`](./types.ts#12) for more options.

# Use Tailwind CLI in Builds

You can alternatively use Tailwind's standalone CLI to compile your CSS. In your
Fresh project directory (change `deno.json` to `deno.jsonc` if needed):

```shell
deno run -c deno.json https://deno.land/x/fresh_tailwind/main.ts --install
```

This will download a binary of the
[Tailwind standalone CLI](https://tailwindcss.com/blog/standalone-cli) build
from GitHub, according to your Deno environment's OS. The binary hash is
compared to the
[published list of checksums](https://github.com/tailwindlabs/tailwindcss/releases/download/v3.3.3/sha256sums.txt)
before it is saved to disk. It will amend Tailwind build tasks to the project's
`deno.json` or `deno.jsonc` file, and will create `tailwind.config.ts` and
`src/style.css` files if they do not already exist.

## Build Options

Compile Tailwind CSS independently.

```shell
deno task tailwind:build
```

**or**

Watch project directory to compile Tailwind CSS independently.

```shell
deno task tailwind:watch
```

> You may need to update the tasks in `deno.json` or `deno.jsonc` to omit the
> CSS destination from the list of watched directories.

**or**

#### Build with Fresh

Include the build plugin to compile Tailwind CSS during Fresh's build process.

```ts
import { defineConfig } from "$fresh/server.ts";
import tailwindBuildPlugin from "fresh_tailwind/build.ts";

export default defineConfig({
  plugins: [
    tailwindBuildPlugin(),
  ],
});
```

Running `deno task build` will now include the Tailwind build step.

##### Manual Labor 😨

- Add `bin/tailwindcss` to your `.gitignore` file.

---

# Using IntelliSense

The following example shows how to enable **Tailwind plugins** in
[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss).
IntelliSense requires a `tailwind.config.ts` file in the project directory.

The Tailwind IntelliSense extension is powered by a Vite language server.
IntelliSense hints will not work if _Vite_ is unable to process the
`tailwind.config.ts` file.

You can _optionally_ create a Deno-specific Tailwind configuration file for your
Fresh deployment. The Tailwind configuration intended for Deno can simply
[extend the one used for Vite](#tailwinddenots).

### Example

> #### Adding Tailwind Plugins to IntelliSense
>
> Run `npm install` for the Tailwind IntelliSense language server.
>
> ```shell
> npm install tailwindcss-animate --save-dev
> ```
>
> **.gitignore**
>
> ```
> # Node nonsense
> node_modules/
> package-lock.json
> package.json
> ```

#### tailwind.config.ts

```ts
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  theme: {
    extend: {},
  },
  plugins: [animate],
} satisfies Config;
```

#### tailwind.deno.ts

```ts
import animate from "https://esm.sh/tailwindcss-animate@1.0.7";
import config from "./tailwind.config.ts";

export default {
  ...config,
  plugins: [
    ...config.plugins,
    animate,
  ],
};
```

### Example VS Code Settings

#### .vscode/settings.json

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "editor.defaultFormatter": "denoland.vscode-deno",
  "[typescriptreact]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "[javascript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "tailwindCSS.includeLanguages": {
    "plaintext": "html",
    "jsx": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "[tailwindcss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

# Hero Patterns

```jsx
import { pattern } from "fresh_tailwind/hero.ts";

const dotPattern =
  '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4"><path fill="#000000" d="M1 3h1v1H1V3zm2-2h1v1H3V1z"></path></svg>';

export default function HeroBanner() {
  return (
    <div
      class="bg-[#86efb5]"
      style={pattern("#7ec19c", dotPattern)}
    >
    </div>
  );
}
```

# Heroicons

Extend your import map, or `deno.json` / `deno.jsonc` imports property, with the
following items:

```json
{
  "react": "https://esm.sh/preact@10.18.1/compat",
  "react/": "https://esm.sh/preact@10.18.1/preact/compat/",
  "react-dom": "https://esm.sh/preact@10.18.1/compat",
  "@heroicons/24/outline/": "https://unpkg.com/@heroicons/react@2.0.18/24/outline/esm/",
  "@heroicons/24/solid/": "https://unpkg.com/@heroicons/react@2.0.18/24/solid/esm/",
  "@heroicons/20/solid/": "https://unpkg.com/@heroicons/react@2.0.18/20/solid/esm/"
}
```

## Usage

```jsx
import BeakerIcon from "@heroicons/24/solid/BeakerIcon.js";

<BeakerIcon />;
```

---

# The Path of Least Resistance

Tailwind can work independently from Fresh given the correct `content` paths.
You're still able to use `npx tailwindcss` to initialize and compile Tailwind
CSS in your Fresh project directory. If that works for you,
[go for it](https://tailwindcss.com/docs/installation).

If you'd prefer to stray further away from Node.js, you can use this plugin to
better integrate Tailwind CSS in your Fresh project.

---

## License

MIT
