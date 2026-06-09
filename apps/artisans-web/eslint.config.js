import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // --- Design system: anti-regresión de tokens (ver DESIGN.md y scripts/audit-design-tokens.mjs) ---
  // Nivel "warn" global; se sube a "error" por carpeta a medida que cada área se migra.
  {
    files: ["src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/#[0-9a-fA-F]{3}/]",
          message:
            "Color hex hardcodeado en className. Usa un token del design system (ej. bg-brand-orange, text-on-surface). Ver DESIGN.md.",
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/text-\\[\\d+px\\]/]",
          message:
            "Tamaño tipográfico arbitrario. Usa la escala del design system (text-2xs, text-3xs, text-micro...). Ver DESIGN.md §3.",
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/font-\\['/]",
          message:
            "Familia tipográfica inline. Usa font-manrope o font-noto-serif del tailwind.config.",
        },
      ],
    },
  },
  // Áreas ya migradas: regresión de hex/fuentes es error.
  // (cms/preview se excluye: replica fielmente el look de marketplace-web a propósito)
  {
    files: ["src/components/cms/**/*.tsx"],
    ignores: ["src/components/cms/preview/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/#[0-9a-fA-F]{3}/]",
          message:
            "Color hex hardcodeado en className. Usa un token del design system (ej. bg-brand-orange, text-on-surface). Ver DESIGN.md.",
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/font-\\['/]",
          message:
            "Familia tipográfica inline. Usa font-manrope o font-noto-serif del tailwind.config.",
        },
      ],
    },
  }
);
