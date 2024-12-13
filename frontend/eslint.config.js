import eslint from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "eslint.config.js",
      "**/*.generated.ts",
      "dist",
    ],
  },
  eslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "react-hooks": hooksPlugin,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsConfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs.flat["jsx-runtime"].rules,
      ...hooksPlugin.configs.recommended.rules,
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-filename-extension": ["error", {extensions: [".tsx"]}],
      "react-refresh/only-export-components": "error",
      "@typescript-eslint/consistent-indexed-object-style": ["error", "index-signature"],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unused-expressions": ["error", {
        allowShortCircuit: true,
        allowTernary: true,
      }],
      "@typescript-eslint/switch-exhaustiveness-check": ["error", {
        considerDefaultExhaustiveForUnions: true,
        requireDefaultForNonUnion: true,
      }],
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "no-console": "error",
      "eqeqeq": "error",
    },
  },
];
