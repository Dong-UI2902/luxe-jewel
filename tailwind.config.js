/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: 'rgb(13 13 13 / 0.9)', // Màu đen chủ đạo bạn muốn
          light: 'rgb(204 204 204)', // Màu xám bạc bạn muốn
          dark: '#000000', // Đen tuyền
          button: '#1a1a1a', // Đen nhẹ cho nút bấm
          subtle: 'rgba(0, 0, 0, 0.05)', // Xám cực nhạt cho background nhẹ
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          mid: '#2C2C2C',
          light: '#4A4A4A',
        },
        luxury: {
          white: '#FFFFFF',
          warm: '#FAFAFA',
          muted: '#767676',
          border: '#EBEBEB',
          'border-dark': '#D8D8D8',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '8xl': '6rem',
        '9xl': '8rem',
        '10xl': '10rem',
      },
      letterSpacing: {
        luxury: '0.2em',
        wide: '0.08em',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        shimmer: 'shimmer 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        product: '0 4px 24px rgba(26, 26, 26, 0.08)',
        'product-hover': '0 12px 40px rgba(26, 26, 26, 0.14)',
        gold: '0 4px 24px rgba(212, 175, 55, 0.2)',
        drawer: '-4px 0 40px rgba(26, 26, 26, 0.12)',
      },
    },
  },
  plugins: [],
};
