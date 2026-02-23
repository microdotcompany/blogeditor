module.exports = {
  apps: [
    {
      name: 'blogeditor-dashboard',
      script: './server/dist/index.js',
      node_args: '--experimental-specifier-resolution=node',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '4G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
  deploy: {
    production: {
      user: 'ubuntu',
      host: '54.77.32.37',
      ref: 'origin/master',
      repo: 'git@github.com:microdotcompany/blogeditor.git',
      path: '/home/ubuntu',
      'pre-deploy-local': '',
      'post-deploy':
        'git submodule update --init --recursive && npm install && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': '',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  },
};
