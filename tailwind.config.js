/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      // Только основные цвета проекта
      colors: {
        primary: '#503CC3',
        'primary-light': '#EEECF9',
        'gray-custom': '#E1E1E1',
        'gray-text': '#8c959c',
        'accent-blue': '#32C8F0',
        'accent-pink': '#e61e78'
      },
      // Только специфичные breakpoints
      screens: {
        'xs': '320px',
        'sm': '375px',
        'sl': '425px'
      },
      // Только специфичные размеры
      spacing: {
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
        '26': '6.5rem'  // 104px
      }
    }
  },
  plugins: []
}
