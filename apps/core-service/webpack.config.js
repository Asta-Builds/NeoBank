const { withNx } = require('@nx/webpack');
const { join } = require('path');

const options = {
  target: 'node',
  compiler: 'tsc',
  main: join(__dirname, './src/main.ts'),
  tsconfig: join(__dirname, './tsconfig.app.json'),
  assets: [join(__dirname, './src/assets')],
  optimization: false,
  outputHashing: 'none',
};

module.exports = (config, context) => {
  if (context && context.options) {
    return withNx(options)(config, context);
  }
  // Fallback for when context is missing (e.g., project graph creation)
  return config || { target: 'node' };
};
