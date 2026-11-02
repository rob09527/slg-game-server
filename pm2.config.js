module.exports = {
  apps: [{
    name: "admin",
    script: "index.js",
    cwd: '/Applications/work/king_admin/',
    args: '--config config.149.js',
    env: {
      "NODE_ENV": "dev",
    },
  },
  {
    name: "battle",
    script: "server.js",
    cwd: '/Applications/work/king_battle/',
    argv: {
      "_port": 28100
    },
    env: {
      "NODE_ENV": "dev",

    }
  },
  {
    name: "agent",
    script: "index.js",
    cwd: '/Applications/work/king_agent/',
    args: 'config.149.json',
    env: {
      "NODE_ENV": "dev",
    },

  }
  ],
}
