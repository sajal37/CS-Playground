import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
    },
  },
  {
    files: ["server/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
      "no-undef": "off",
    },
  },
];
