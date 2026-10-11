/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master BlueLoop Palette: Nature-Inspired Industrial Luxury & Water Tech
        ocean: {
          DEFAULT: '#123B56',
          dark: '#0D2B40',
          light: '#1B4D70',
          deep: '#091D2C',
        },
        water: {
          DEFAULT: '#1677B8',
          dark: '#105B8D',
          light: '#288FD4',
          subtle: '#EBF4FA',
        },
        aqua: {
          DEFAULT: '#24B8C7',
          dark: '#1B8E9A',
          light: '#4ED3E0',
          soft: '#E0F7FA',
        },
        ice: {
          DEFAULT: '#E8F5F8',
          tint: '#F0F9FB',
          border: '#DCE7EB',
        },
        canvas: {
          DEFAULT: '#FAFBF9',
          warm: '#F7F7F2',
        },
        surface: '#FFFFFF',
        ink: {
          primary: '#172B36',
          secondary: '#637680',
          muted: '#8A9BA4',
          subtle: '#B5C4CC',
        },
        edge: {
          DEFAULT: '#DCE7EB',
          subtle: '#E8F0F3',
          strong: '#C5D6DC',
        },
        // Environmental Forest & Teal Secondary Accents
        forest: {
          DEFAULT: '#174D3A',
          dark: '#10392B',
          light: '#205E47',
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
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(18, 59, 86, 0.04)',
        'elevated': '0 8px 24px -4px rgba(18, 59, 86, 0.08), 0 2px 6px -2px rgba(18, 59, 86, 0.04)',
        'float': '0 16px 36px -6px rgba(18, 59, 86, 0.12), 0 4px 12px -2px rgba(18, 59, 86, 0.06)',
        'card': '0 1px 3px 0 rgba(23, 43, 54, 0.04)',
        'glow-aqua': '0 0 20px -2px rgba(36, 184, 199, 0.25)',
      },
    },
  },
  plugins: [],
}
