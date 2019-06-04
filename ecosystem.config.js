module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'pam_app',
      script: '',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    test: {
      user: 'root',
      host: '192.168.10.110',
      ref: 'origin/dev',
      repo: 'https://github.com/thinkmix/pam_app.git',
      path: '/home/nginx/html/pam_app',
      'post-deploy': 'yarn install && yarn build:prod && pm2 reload ecosystem.config.js --env test'
    },
    production: {
      user: 'root',
      host: '47.97.198.73',
      ref: 'origin/master',
      repo: 'https://github.com/thinkmix/pam_app.git',
      path: '/usr/local/nginx/html/pam_app',
      'post-deploy': 'yarn install && yarn build:prod && pm2 reload ecosystem.config.js --env production'
    }
  }
}
