#! /bin/bash
npm install tailwindcss --save-dev
npm ci
npx tailwindcss init --ts
mkdir test
echo '.roboto { font-family: Roboto, sans-serif; }' > test/test.css
sed 's/tailwindcss/npm:tailwindcss/g' test/tailwind.config.ts > test/_tailwind.config.ts
echo '{"imports": {"tailwindcss": "npm:tailwindcss@3.3.5"}}' > import_map.json
deno fmt test/_tailwind.config.ts
deno fmt import_map.json