module.exports = {
  apps: [
    {
      name: 'hmimap-api',
      script: 'server/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 4003,
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
}