import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow setState in useEffect for form population and data loading
      "react-hooks/set-state-in-effect": "off",
      
      // Hydration mismatch prevention
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-sync-scripts": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Warn about potential hydration issues
      "no-restricted-syntax": [
        "warn",
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: "Math.random() can cause hydration mismatches. Use a client-only wrapper or useEffect.",
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: "new Date() without arguments can cause hydration mismatches. Use a fixed date or initialize in useEffect.",
        },
        {
          selector: "MemberExpression[object.name='Date'][property.name='now']",
          message: "Date.now() can cause hydration mismatches. Initialize in useEffect or use a client-only wrapper.",
        },
      ],
      "no-restricted-properties": [
        "warn",
        {
          object: "Number",
          property: "toLocaleString",
          message: "toLocaleString() can cause hydration mismatches due to locale differences. Use formatCurrency() from lib/formatting.ts instead.",
        },
      ],
    },
  },
]);

export default eslintConfig;
