import nextPlugin from "eslint-plugin-next";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...nextPlugin.configs["core-web-vitals"],
  {
    ignores: ["node_modules/", ".next/"],
  },
];
