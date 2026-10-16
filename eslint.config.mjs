import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15 ships a legacy config and crashes when imported as a flat config.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "**/*.json", "tsconfig.tsbuildinfo"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
