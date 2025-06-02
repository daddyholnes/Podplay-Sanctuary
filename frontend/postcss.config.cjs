console.log('--- Loading postcss.config.cjs ---');
try {
  console.log('--- Attempting to resolve tailwindcss from postcss.config.cjs ---');
  const tailwindPath = require.resolve('tailwindcss');
  console.log(`--- Successfully resolved tailwindcss at: ${tailwindPath} ---`);
} catch (e) {
  console.error('--- CRITICAL: Failed to resolve tailwindcss from postcss.config.cjs ---', e);
}

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
