'use strict'

module.exports = exports = async function (ctx, next) {
    let {
        sign,
        game_id
    } = ctx.request.query;
    ctx.assert(ctx.h5postfn(ctx.request.query) === sign, 'VERIFYFAIL'); // 签名验证

    const match = {};
    match.type = {$ne : 1}; // 正式服
    // 这里编写服务器列表包隔离条件逻辑
    if (game_id) {
        const key = '' + game_id;
        match['info.filter'] = {$in: ['all', key]}; // all 表示这个服务器所有包可见
    }
    const list = await global.dao.gameserver.find(match);
    let servers = [];
    list.forEach(serv => {
        let base = serv.base();
        servers.push({
            server_id : base.servid,
            server_name : base.name,
        });
    });

    ctx.body = {
        code : 0,
        msg : "",
        data : servers
    }
}
