const path = require('path');

const distPath = path.resolve(
  __dirname,
  '../build/dist/client/Data/Platform/UI',
);
const deployPath = path.resolve(
  __dirname,
  '../build/dist/server/deploy/client-ui',
);

module.exports = {
  entry: path.resolve(__dirname, 'src/housing-addon/index.js'),
  output: {
    path: distPath,
    filename: 'housing-menu-addon.js',
    clean: false,
  },
  mode: 'production',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ttf|woff|woff2)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.afterEmit.tap('CopyHousingAddonDeploy', () => {
          const fs = require('fs');
          const src = path.join(distPath, 'housing-menu-addon.js');
          const dest = path.join(deployPath, 'housing-menu-addon.js');
          if (!fs.existsSync(src)) {
            return;
          }
          fs.mkdirSync(deployPath, { recursive: true });
          fs.copyFileSync(src, dest);
        });
      },
    },
  ],
};
