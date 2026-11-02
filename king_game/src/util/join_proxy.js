'use strict'
let repeatTimes = 0;
const psend = require('./psend');
module.exports = async function joinProxy() {
    
    global._START_T = Date.now();
    global._HOST = global.config.HOST || '127.0.0.1';
    let is_ssl = global.config.SSL ? 1 : 0;
    // 上报 proxy, proxy 接到上报过后，会主动与该游戏实例进行长链接
    await psend('/sys/serv/join', {
        t: global._START_T,
        host: global._HOST,
        port: global._PORT,
        key: process.pid,
        is_ssl: is_ssl,
        is_timer: process.env.IS_TIMER, // 通过环境变量来向登录服务器声明
        fight: global.config.SCF
    }).catch(e => {
        console.error('join proxy error', repeatTimes, e); // 不停重试
        repeatTimes++;
        if (process.env.NODE_ENV !== 'development' && repeatTimes > 100) {
            process.exit(1); // 一直无法加入 proxy ,exits
        }
        setTimeout(joinProxy, 1000);
    })
}
