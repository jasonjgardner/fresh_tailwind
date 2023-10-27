export const DEFAULT_SRC_DIR = "./src";
export const DEFAULT_STYLE_NAME = "styles.css";
export const DEFAULT_STYLE_SRC = `${DEFAULT_SRC_DIR}/${DEFAULT_STYLE_NAME}`;
export const DEFAULT_STYLE_DEST = `./static/${DEFAULT_STYLE_NAME}`;
export const DEFAULT_TAILWIND_CONFIG = "./tailwind.config.ts";
export const TAILWIND_VERSION = "3.3.5";
export const TAILWIND_REPO =
  `https://github.com/tailwindlabs/tailwindcss/releases/download/v${TAILWIND_VERSION}`;

export const TAILWIND_PREFLIGHT = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
