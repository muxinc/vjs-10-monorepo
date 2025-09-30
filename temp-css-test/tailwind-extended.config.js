const path = require('path');

module.exports = {
  content: ['./MediaSkinDefaultInlineClasses.tsx'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        '3xl': '64px',
      },
      backdropSaturate: {
        '150': '1.5',
      },
      backdropBrightness: {
        '90': '.9',
      },
      textShadow: {
        '2xs': '0 1px 1px rgb(0 0 0 / 0.5)',
      },
    },
  },
  plugins: [
    require(path.resolve('../packages/build-tools/tailwind-css-compiler/node_modules/@tailwindcss/container-queries')),
  ],
}