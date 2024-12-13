import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nodePlugin from "eslint-plugin-n";

export default [
  {
    ignores: [
      "eslint.config.js",
      "**/*.generated.ts",
      "dist",
    ],
  },
  eslint.configs.recommended,
  nodePlugin.configs["flat/recommended-script"],
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsConfigRootDir: import.meta.dirname,
      },
    },
    rules: {
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
      "eqeqeq": "error",
      "no-console": "error",
      "n/no-extraneous-import": "off", // https://github.com/eslint-community/eslint-plugin-n/issues/209
    },
  },
];
