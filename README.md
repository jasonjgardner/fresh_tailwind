# Fresh Tailwind CSS Plugin

## The Path of Least Resistance

Tailwind can work independently from Fresh given the correct `content` paths.
You're still able to use `npx tailwindcss` to initialize and compile Tailwind
CSS in your Fresh project directory. If that works for you,
[go for it](https://tailwindcss.com/docs/installation).

If you'd prefer to stray further away from Node.js, you can use this plugin to
better integrate Tailwind CSS in your Fresh project.

### Setup

In your Fresh project directory:

```shell
deno run -c deno.json https://deno.land/x/fresh_tailwind/main.ts --install
```

This will download a binary of the
[Tailwind standalone CLI](https://tailwindcss.com/blog/standalone-cli) build
from GitHub, according to your Deno environment's OS. The binary hash is
compared to the
[published list of checksums](https://github.com/tailwindlabs/tailwindcss/releases/download/v3.3.3/sha256sums.txt)
before it is saved to disk. It will amend Tailwind build tasks to the project's
`deno.json` file, and will create `tailwind.config.ts` and `src/style.css` files
if they do not already exist.

### Build Options

Compile Tailwind CSS independently.

```shell
deno task tailwind:build
```

---

Watch project directory to compile Tailwind CSS independently.

```shell
deno task tailwind:watch
```

> You may need to update the tasks in `deno.json` to omit the CSS destination
> from the list of watched directories.

---

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

---

### Manual Labor 😨

- Add `<link href="/styles.css" rel="stylesheet" />` to your Fresh website's
  `<head>`
- Add `bin/tailwindcss` to your `.gitignore` file.

---

## Using IntelliSense

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

Extend your import map, or `deno.json` imports property, with the following
items:

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

## License

MIT
