module.exports = {
  apps: [
    {
      name: 'nx-nodejs-app',
      script: 'dist/main.js',
      instances: "3",
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
