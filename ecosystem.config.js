module.exports = {
  apps: [{
    name: 'carpet-store',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/carpet-store',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
