/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rg: {
          bg: "#060b13",
          navy: "#0a1226",
          card: "#0d1830",
          cardHover: "#112040",
          border: "#17284b",
          borderHighlight: "#24447d",
          electric: "#1d63ff",
          cyan: "#00d4ff",
          cyanMuted: "#0284c7",
          glow: "rgba(0, 212, 255, 0.15)",
          textPrimary: "#f1f5f9",
          textMuted: "#94a3b8",
          textDim: "#64748b"
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.25)',
        'glow-electric': '0 0 25px rgba(29, 99, 255, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
