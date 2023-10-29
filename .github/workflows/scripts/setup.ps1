#! /usr/bin/env pwsh -Command -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Unrestricted
mkdir test
Set-Location .\test
npm install tailwindcss --save-dev
npm ci
npx tailwindcss init --ts
(Get-Content .\tailwind.config.ts) -replace "tailwindcss", "npm:tailwindcss" | Out-File .\_tailwind.config.ts
# Run Deno format
deno fmt .\_tailwind.config.ts
Write-Output '{"imports": {"tailwindcss": "npm:tailwindcss@3.3.5"}}' > import_map.json
