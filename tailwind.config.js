/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: ['class', '.theme-dark'],
  // Angular Material ships its own resets; Tailwind's preflight would fight them.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)', surface: 'var(--surface)', raised: 'var(--raised)', line: 'var(--line)',
        text: 'var(--text)', muted: 'var(--muted)', brass: 'var(--brass)', up: 'var(--up)', down: 'var(--down)',
      },
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
