module.exports = {
  apps: [
    {
      name: "blogeditor",
      script: "server/dist/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
