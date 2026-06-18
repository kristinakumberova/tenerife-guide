import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// react-refresh plugin odebrán s Vite (Astro nemá React Fast Refresh HMR).
// react-hooks zůstává — platí pro React islands.
export default tseslint.config(
  { ignores: ["dist", ".astro", "src/data/*.json", "**/*.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
);
