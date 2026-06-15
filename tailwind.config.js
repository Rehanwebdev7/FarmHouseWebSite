/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        midnight: "#0D0D0D",
        obsidian: "#121212",
        chalk: "#F5F5F7",
        platinum: "#E2E8F0",
        gold: "#D4AF37",
        azure: "#007A87",
        border: "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "luxury-gradient": "linear-gradient(180deg, #121212 0%, #0D0D0D 100%)",
        "gold-gradient": "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)",
        "gold-glow": "radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 70%)",
        "azure-glow": "radial-gradient(circle, rgba(0,122,135,0.15) 0%, rgba(0,0,0,0) 70%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulseSlow 8s ease-in-out infinite",
        "border-glow": "borderGlow 4s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.5" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(212, 175, 55, 0.2)" },
          "50%": { borderColor: "rgba(0, 122, 135, 0.4)" },
        }
      }
    },
  },
  plugins: [],
}
