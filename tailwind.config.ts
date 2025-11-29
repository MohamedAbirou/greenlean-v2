/**
 * Tailwind CSS v4 Configuration
 * Theme tokens defined in src/index.css @theme block
 */
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Tailwind v4: Theme is defined in CSS @theme block (src/index.css)
  // This config file is minimal - all design tokens are in @theme
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
