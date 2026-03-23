// PM2 Ecosystem Config — dev-dashboard SSR
// Usage:
//   pm2 start ecosystem.config.cjs          (start with defaults)
//   pm2 start ecosystem.config.cjs --env production
//   pm2 restart dev-dashboard
//   pm2 logs dev-dashboard
//   pm2 save && pm2 startup               (persist across reboots)

module.exports = {
  apps: [
    {
      name: 'dev-dashboard',
      script: './dist/ssr/index.js',

      // ---------- Runtime env ----------
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        // CORS_ORIGIN is optional — defaults to http://localhost:<PORT>
        // Uncomment and set when the dashboard is accessed from a different host/port:
        // CORS_ORIGIN: 'http://192.168.1.100:3000',
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: '3000',
      },

      // ---------- Process options ----------
      instances: 1,          // SSR keeps state in lowdb — single instance only
      exec_mode: 'fork',     // not cluster — lowdb is not multi-process safe
      autorestart: true,
      watch: false,

      // ---------- Logging ----------
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // ---------- Memory guard ----------
      max_memory_restart: '300M',
    },
  ],
};
