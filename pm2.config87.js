module.exports = {
  apps: [
    {
      name: "agent87",
      script: "index.js",
      cwd: '/Applications/work/king_agent/',
      args: 'config.87.json',
      env: {
        "NODE_ENV": "dev",
      },
    }, {
      name: "admin87",
      script: "index.js",
      cwd: '/Applications/work/king_admin/',
      args: '--config config.87.js',
      env: {
        "NODE_ENV": "dev",
      },
    },
    {
      name: "battle87",
      script: "server.js",
      cwd: '/Applications/work/king_battle/',
      env: {
        "NODE_ENV": "dev",
      }
    },
  ],
}
