const webpack = require('webpack');
const getProcessWithEnvVars = require('./scripts/get-process-with-env-vars');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      process: JSON.stringify(getProcessWithEnvVars()),
    }),
  ],
};
