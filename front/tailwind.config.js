module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
      screens: {
      sm_menu: '500px',
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
      charts: '1140px',
      scorecard: '1220px',
    },
    extend: {
      colors:{
        'show-more-blue': '#0066cc',
      },
      maxHeight: {
        'arrowbox': '2.375rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
