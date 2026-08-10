/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827', // primary black
        paper: '#FFFFFF', // primary white
        pitch: {
          DEFAULT: '#10B981', // emerald green — primary accent / CTA
          hover: '#059669', // hover green
        },
        surface: '#1F2937', // dark card surface
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        wide: '0.08em',
        widest: '0.2em',
      },
      keyframes: {
        'stripe-drift': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '160px 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'stripe-drift': 'stripe-drift 6s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
      },
      boxShadow: {
        kit: '0 20px 40px -12px rgba(17, 24, 39, 0.18)',
        'kit-hover': '0 28px 56px -14px rgba(16, 185, 129, 0.28)',
      },
    },
  },
  plugins: [],
};
