/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#103489",
          "primary-content": "white",
          secondary: "#51BBDB",
          "secondary-content": "#212638",
          accent: "#8bc134",
          "accent-content": "#212638",
          neutral: "#242A38",
          "neutral-content": "#ffffff",
          "base-100": "#F7F6F9",
          "base-200": "#F7F6F9",
          "base-300": "#33B7DB",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#ffd016",
          "primary-content": "#0D1117",
          secondary: "#385183",
          "secondary-content": "#ffffff",
          accent: "#ffd016",
          "accent-content": "#0D1117",
          neutral: "#ffffff",
          "neutral-content": "#0D1117",
          "base-100": "#0D1117",
          "base-200": "#161B22",
          "base-300": "#21262D",
          "base-content": "#ffffff",
          info: "#385183",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
