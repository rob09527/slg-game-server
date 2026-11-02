'use strict'
const GameServer = require('../../../../util/GameServer');
// 游戏实例加入
module.exports = exports = async function (ctx, next) {
    let {
        is_timer,
        host,
        port,
        t, // 时间戳
        is_ssl,
        key, // 加密key
        fight
    } = ctx.request.body;
    ctx.body = {};
    const ip = ctx.ip.split(':').pop();
    ctx.assert(Math.abs(Date.now() - t) <= 5 * 60 * 1000, 'expire join'); // 保证链接数据是新鲜的
    // 执行链接
    const gserv = await GameServer.initInstance(ip, host, port, key, t, is_ssl);
    gserv.ip = ip;
    if (is_timer) {
        global.gametimer = gserv; // 游戏定时器实例，单独分配空间，因为不能让客户端链接
    } else {
        global.gameservs[`${host}:${port}`] = gserv;
        if (fight && fight.BASE) {
            const t1 = fight.BASE.split('//');
            if (t1[1]) {
                const t2 = t1[1].split(':');
                if (t2[0] != '') {
                    global.fightservs[`${host}:${port}`] = t2[0];
                }
            }
        }

        if (global.serverRoleNum == undefined) {
            global.serverRoleNum = {}; // 先占位，避免下面await异步处理触发多次        
            global.serverRoleNum = await gserv.remote.serverRoleNum();
            console.log("serverRoleNum", global.serverRoleNum);

            await global.dao.order.payRoleNum();
            console.log("serverPayNum", global.serverPayNum);

            let rno = await gserv.remote.initRoleNo();
            console.log("init rno", rno);
        }
    }
}
