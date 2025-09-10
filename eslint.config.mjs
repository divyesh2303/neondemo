// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // ⬇️ Ignore generated Prisma clients
  {
    ignores: [
      "src/app/lib/prisma-master/**",
      "src/app/lib/prisma-project/**",
      "src/app/lib/project-client/**",
    ],
  },
  // Keep Next.js recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
