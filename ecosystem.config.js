module.exports = {
  apps : [{
    name   : "weather-wizard-server",
    script : "npm",
    args   : "run dev:server",
    watch  : ["server"], // Optional: Watch the 'server' directory for changes and restart
    ignore_watch : ["node_modules"], // Optional: Ignore node_modules when watching
    env: {
      NODE_ENV: "development",
    },
    env_production: { // Optional: Configuration for production
      NODE_ENV: "production",
    }
  }]
} 