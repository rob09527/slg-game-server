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
    gameconfigpath: '/<yourpath>/KingSell/config', // 游戏项目的配置
    timezone: '+08:00',
    db: {
        mongo: {
            main: {
                // host
                host: "localhost",
                // 端口号
                port: "17016",

                // 数据库名-这里是管理后台的数据库
                database: "test-admin",
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
    es: {replicas: 0, shards: 1},
    // 服务器对应的代码路径
    servpath: {
        game: '/<yourpath>/KingSell/server',
        config: '/<yourpath>/KingSell/config',
        exec: '/<yourpath>/KingSell/exec',
        prob: '/<yourpath>/KingSell/prob',
    },
    game: { // 游戏实例部分的配置
        db: {
            "HOST": "localhost",
            "PORT": 17016,
            "NAME": "test",
            "AUTH": {
                "USER": "root",
                "PWD": "YOUR_DB_PASSWORD",
                "SOURCE": "admin"
            }
        },
        es: {
            "HOST": "localhost:19200",
            "DEF_INDEX": "king"
        },
        redis: {
            "HOST": "localhost",
            "PORT": 16379,
            "PASSWORD": "YOUR_REDIS_PASSWORD"
        },
        robot: ''
    },
    docspath: '/<yourpath>/KingSell/docs',  // 后台转表目录(不开启转表功能，注释掉这行)
    proxy: 'http://127.0.0.1:8001', // 登陆服的内网IP
    agent: 'ws://127.0.0.1:8004' // 定时器服的外网地址
}
