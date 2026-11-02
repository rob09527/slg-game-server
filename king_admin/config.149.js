/**
 * @param app {App}
 * @return
 */
module.exports = {
    // PROTOCOL : 'https', // 协议
    // SSL_PATH: { //TODO  https 协议需要指定证书地址
    //     KEY: 'YOUR_CIPHER_KEY_',
    //     CRT: '/yours-path/www.xxx.com.pem'
    // },
    gameconfigpath: '../config', // 游戏项目的配置
    timezone: '+08:00',
    db: {
        mongo: {
            main: {
                // host
                host: "127.0.0.1",
                // 端口号
                port: "27017",

                // 数据库名-这里是管理后台的数据库
                database: "web-admin",
            }
        }
    },
    es: { replicas: 0, shards: 1 },
    // 服务器对应的代码路径
    servpath: {
        game: '../king_game',
        config: '../config',
        exec: '../exec',
        prob: '../prob',
    },
    game: { // 游戏实例部分的配置
        db: {
            "HOST": "127.0.0.1",
            "PORT": 27017,
            "NAME": "game",
        },
        es: {
            "HOST": "127.0.0.1:19200",
            "DEF_INDEX": "king"
        },
        redis: {
            "HOST": "127.0.0.1",
            "PORT": 6379,
        },
        robot: ''
    },
    docspath: '../docs',  // 后台转表目录(不开启转表功能，注释掉这行)
    proxy: 'http://127.0.0.1:8001', // 登陆服的内网IP
    agent: 'ws://127.0.0.1:20000', // 定时器服的外网地址
    monetary_unit: 'VND'
}
