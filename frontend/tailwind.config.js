/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nature-Inspired Industrial Luxury Palette
        ivory: '#F7F7F2',
        surface: '#FFFFFF',
        forest: {
          DEFAULT: '#174D3A',
          dark: '#10392B',
          light: '#205E47',
          soft: '#2D755A',
          mist: '#D9E8DF',
        },
        teal: {
          DEFAULT: '#168779',
          dark: '#11655B',
          light: '#23A292',
          wash: '#EBF5F3',
        },
        river: {
          DEFAULT: '#397FA3',
          dark: '#286280',
          light: '#5396BA',
          tint: '#EAF3F6',
        },
        mist: {
          DEFAULT: '#D9E8DF',
          light: '#EAF2ED',
          dark: '#B8D1C3',
        },
        ink: {
          primary: '#202A24',
          secondary: '#69736B',
          muted: '#8C978F',
          subtle: '#A8B3AB',
        },
        edge: {
          DEFAULT: '#E0E5DF',
          subtle: '#ECEFEA',
          strong: '#CBD3CA',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(23, 77, 58, 0.04)',
        'elevated': '0 4px 12px -2px rgba(23, 77, 58, 0.06), 0 2px 4px -2px rgba(23, 77, 58, 0.03)',
        'card': '0 1px 3px 0 rgba(32, 42, 36, 0.04)',
      },
    },
  },
  plugins: [],
}
