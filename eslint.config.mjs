import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";
import noSecrets from "eslint-plugin-no-secrets";
import sonarjs from "eslint-plugin-sonarjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      security,
      "no-secrets": noSecrets,
      sonarjs,
    },
    rules: {
      // Security rules
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-new-buffer": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-object-injection": "off", // Too many false positives
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-unsafe-regex": "error",
      
      // No secrets in code
      "no-secrets/no-secrets": ["error", { "tolerance": 4.5 }],
      
      // SonarJS code quality rules (v3.0.5 compatible)
      "sonarjs/cognitive-complexity": ["warn", 20],
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-duplicate-string": ["warn", { threshold: 5 }],
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/no-inverted-boolean-check": "warn",
      "sonarjs/no-nested-switch": "warn",
      "sonarjs/no-nested-template-literals": "warn",
      "sonarjs/no-redundant-boolean": "warn",
      "sonarjs/no-small-switch": "warn",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/prefer-object-literal": "warn",
      "sonarjs/prefer-single-boolean-return": "warn",
      "sonarjs/prefer-while": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "reports/**",
    "node_modules/**",
    ".stryker-tmp/**",
  ]),
]);

export default eslintConfig;
