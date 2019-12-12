const { availableEnvVars } = require('../environment');

module.exports = () => {
  return {
    env: availableEnvVars.reduce((envVars, envVar) => ({ ...envVars, [envVar]: process.env[envVar] }), {}),
  };
};
