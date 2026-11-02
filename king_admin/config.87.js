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
    gameconfigpath: '../config', // admin游戏项目的配置
    timezone: '+08:00',
    db: {
        mongo: {
            main: {
                // host
                host: "127.0.0.1",
                // 端口号
                port: "17017",

                // 数据库名-这里是管理后台的数据库
                database: "web-admin",
                auth: {
                    // 用户名
                    user: 'root',
                    // 密码
                    password: 'YOUR_DB_PASSWORD',
                    source: 'admin'
                },
            }
        }
    },
    // 其它游戏服务器对应的代码路径
    servpath: {
        game: '/home/sanguo/king_game',
        config: '/home/sanguo/config',
        exec: '/home/sanguo/exec',
        prob: '/home/sanguo/prob',
    },
    game: { // 游戏实例部分的配置
        db: {
            "HOST": "127.0.0.1",
            "PORT": 17017,
            "NAME": "game",
            "AUTH": {
                "USER": "root",
                "PWD": "YOUR_DB_PASSWORD",
                "SOURCE": "admin"
            }
        },
        es: {
            "HOST": "127.0.0.1:19200",
            "DEF_INDEX": "king"
        },
        redis: {
            "HOST": "127.0.0.1",
            "PORT": 16379,
            "PASSWORD": "YOUR_REDIS_PASSWORD"
        },
        battle: {
            'host': "127.0.0.1",
            'path': "/home/sanguo"
        },
        robot: ''
    },
    docspath: '../docs',
    proxy: 'http://127.0.0.1:8001', // 登陆服的内网IP
    agent: 'ws://127.0.0.1:20000', // 定时器服的外网地址
}