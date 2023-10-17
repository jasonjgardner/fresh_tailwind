# Fresh Tailwind CSS Plugin

## Zero Config

Call the plugin with no configuration values for a quick, initial setup.

**fresh.config.ts**

```ts
import { defineConfig } from "$fresh/server.ts";
import tailwindPlugin from "https://deno.land/x/fresh_tailwind/mod.ts";

export default defineConfig({
  plugins: [
    tailwindPlugin(),
  ],
});
```

## Some Config

Provide configuration settings to optimize your CSS output and improve your DX.

**fresh.config.ts**

```ts
import { defineConfig } from "$fresh/server.ts";
import tailwindPlugin from "https://deno.land/x/fresh_tailwind/mod.ts";

const IS_DEV = import.meta.url.endsWith("/dev.ts") ||
  Deno.env.get("FRSH_DEV_PREVIOUS_MANIFEST") !== undefined;

export default defineConfig({
  plugins: [
    tailwindPlugin({
      // Input CSS string
      css: await Deno.readTextFile("./src/style.css"),
      // Whether or not to pass Fresh's HTML output to PostCSS during render
      hookRender: IS_DEV,
      // Where the compiled CSS will be saved
      dest: "./static/styles.css",
      // Path to Tailwind CSS configuration for compiler
      configFile: "./tailwind.deno.ts",
    }),
  ],
});
```

### Note

Setting `dest` to a location within a watched directory (i.e. `./static`) could
cause a refresh loop.

If `dest` is provided and `hookRender` is not, or is `false`, an initial build
step will be required to create the CSS file.

In your Fresh project directory:

```shell
deno run --allow-read --allow-write --allow-env --config=./deno.json https://deno.land/x/fresh_tailwind/main.ts
```

## Using IntelliSense

The following example shows how to enable **Tailwind plugins** in
[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss).
IntelliSense requires a `tailwind.config.ts` file in the project directory.

The Tailwind IntelliSense extension is powered by a Vite language server.
IntelliSense hints will not work if _Vite_ is unable to process the
`tailwind.config.ts` file.

You can create a Deno-specific Tailwind configuration file for your Fresh
deployment. The Tailwind configuration intended for Deno can simply
[extend the one used for Vite](#tailwinddenots).

### Example

> #### Using Tailwind plugins?
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
  }
}
```

## License

MIT
