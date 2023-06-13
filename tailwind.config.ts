import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite"
      },
      colors: {
        brand: {
          black: "#000",
          blue: "#0788ff",
          "bright-turquoise": "#1bf8ec",
          "cerebral-grey": "#ccc",
          "chaos-black": "#101010",
          "cloud-blue": "#0788ff",
          cyan: "#0dcaf0",
          danger: "#dc3545",
          dark: "#212529",
          "dark-blue": "#0037a5",
          "deep-purple": "#190f33",
          "electric-purple": "#6933ff",
          "evening-hush": "#7e89a9",
          focus: "#c7b3ff",
          gray: "#6e6e6e",
          "gray-b": "#bebbce",
          "gray-dark": "#343a40",
          "gray-f4": "#f4f4f4",
          green: "#37a806",
          "hidden-sapphire": "#475872",
          indigo: "#6610f2",
          info: "#0dcaf0",
          "iridescent-blue": "#00fced",
          light: "#f8f9fa",
          "narwhal-grey": "#060c12",
          "neutral-400": "#c0c6d9",
          "not-tonight": "#0b0717",
          orange: "#fd7e14",
          pink: "#d63384",
          primary: "#6933ff",
          purple: "#6f42c1",
          red: "#dc3545",
          secondary: "#6e6e6e",
          "starfleet-blue": "#0496ff",
          success: "#37a806",
          teal: "#20c997",
          warning: "#ffc107",
          white: "#fff",
          "white-smoke": "#f5f5f5",
          yellow: "#ffc107"
        }
      }
    }
  }
} satisfies Config;
