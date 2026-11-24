/** @type {import('tailwindcss').Config} */
const jpAccentScale = {
  50: '#FFF1F5',
  100: '#FFFAFC',
  200: '#F4C6D5',
  300: '#EFB2C5',
  400: '#E8A0B8',
  500: '#D97D9B',
  600: '#A63F63',
  700: '#81314F',
  800: '#5D273C',
  900: '#382832',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: jpAccentScale,
        champagne: jpAccentScale,
        rosegold: jpAccentScale,
        jp: {
          paper: '#FFFDFA',
          porcelain: '#F7F2EE',
          ink: '#30242A',
          muted: '#6B5A62',
          berry: '#A63F63',
          'berry-deep': '#81314F',
          rose: '#EAB6C5',
          champagne: '#D6C3A5',
        },
      },
      
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
