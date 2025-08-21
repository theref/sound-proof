import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { 
    ignores: [
      "dist",
      "convex/_generated/**",
      "api/**/*.ts", // Unused API files 
      "src/components/MusicFeed.tsx", // Legacy unused components
      "src/components/UploadTrack.tsx",
      "src/components/UserProfile.tsx",
      "src/components/WalletConnection.tsx",
      "src/components/TacoConditionsForm.tsx",
      "src/integrations/farcaster/**", // Legacy integrations with any types
      "src/integrations/supabase/**", // Legacy integrations
      "src/types/window.d.ts", // Contains any types for browser APIs
      "src/utils/localStorage.ts" // Legacy localStorage with any types
    ] 
  },
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
  }
);
