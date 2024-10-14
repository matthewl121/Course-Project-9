import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
    },
    rules: {
      "no-unused-vars": "off", // Disable the no-unused-vars rule
      "@typescript-eslint/no-unused-vars": "off", // Disable the TypeScript-specific no-unused-vars rule
      "@typescript-eslint/no-explicit-any": "off", // Allow the use of the any type
    },
  },
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
];
