module.exports = {
  apps: [
    {
      name: "agent",
      script: "index.js",
      cwd: '/home/sanguo/king_agent/',
      args: '/home/sanguo/json/config.agent.json',
      env: {
        "NODE_ENV": "dev",
      },
    }, {
      name: "admin",
      script: "index.js",
      cwd: '/home/sanguo/king_admin/',
      args: '/home/sanguo/json/config.admin.js',
      env: {
        "NODE_ENV": "dev",
      },
    },
    {
      name: "battle",
      script: "server.js",
      cwd: '/home/sanguo/king_battle/',
      env: {
        "NODE_ENV": "dev",
      }
    }, {
      name: "proxy",
      script: "app.js",
      cwd: '/home/sanguo/king_proxy/',
      args: '/home/sanguo/json/config.proxy.json',
      env: {
        "NODE_ENV": "dev",
      },
    }, {
      name: "game",
      script: "index.js",
      cwd: '/home/sanguo/king_game/',
      args: '/home/sanguo/json/config.game.json',
      env: {
        "NODE_ENV": "dev",
      },
    }
  ],
}
