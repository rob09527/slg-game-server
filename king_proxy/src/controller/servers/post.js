'use strict'

module.exports = exports = async function (ctx, next) {
    const now = Date.now();
    // const match = {};
    const opts = ctx.request.body;
    // if(opts.opentime){
    //     match.type = {$ne : 1}
    // }
    // // 这里编写服务器列表包隔离条件逻辑
    // if (opts.channel && opts.gameid) {
    //     const key = opts.channel + '_' + opts.gameid;
    //     match['info.filter'] = {$in: ['all', key]}; // all 表示这个服务器所有包可见
    // }
    // const list = await global.dao.gameserver.find(match);




    ctx.body = {};
    let servers = [];
    let opentime = global.CACHE.gameserver.opentime;
    const list = global.CACHE.gameserver.list;
    for (const k in list) {
        const serv = list[k];
        if (opts.opentime) {
            if (now >= serv.start) {
                servers.push(serv.base());
            }
        }
        else {
            servers.push(serv.base());
        }
    };
    let servertime = Date.now();
    ctx.body.serverlist = servers;
    ctx.body.opentime = opentime[0];
    ctx.body.servertime = servertime;
    let type = servertime >= opentime ? 0 : 1;
    // let notice = await ctx.dao.maintain.findOne({type});
    let notice = global.CACHE.maintain[type];
    if (notice) {
        ctx.body.noticestr = notice.content;
    }
    let {
        uid,
    } = ctx.request.body;

    if (uid) {
        const game = Object.values(global.gameservs)[0]; // 取一个游戏实例
        const roles = await game.remote.findRolesByUid(uid);
        const roleMap = {};
        roles.forEach(role => {
            roleMap[role.servid] = role;
        });
        ctx.body.serverlist.forEach(serv => {
            serv.role = roleMap[serv.servid];
            serv.lastlogin = serv.role && serv.role.update;
        })
    }
    ctx.body.serverlist[0] && (ctx.body.serverlist[0].recommend = 1); // 第一个服为推荐服
}
