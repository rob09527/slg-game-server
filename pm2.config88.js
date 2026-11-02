module.exports = {
  apps: [
    {
      name: "agent88",
      script: "index.js",
      cwd: '/Applications/work/king_agent/',
      args: 'config.88.json',
      env: {
        "NODE_ENV": "dev",
      },
    }, {
      name: "admin88",
      script: "index.js",
      cwd: '/Applications/work/king_admin/',
      args: '--config config.88.js',
      env: {
        "NODE_ENV": "dev",
      },
    },
    {
      name: "battle88",
      script: "server.js",
      cwd: '/Applications/work/king_battle/',
      env: {
        "NODE_ENV": "dev",
      }
    },
  ],
}
