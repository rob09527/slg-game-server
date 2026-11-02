
'use strict'
// 获得国王战玩家信息和阵容信息
module.exports = exports = async (ctx, next) => {
    let {
        rids = []
    } = ctx.request.body;
    ctx.body = [];
    for (let mix of rids) {
        let [
            rid,
            sid,
        ] = mix.split('|');
        ctx.assert(rid && sid, 'invalid data')
        let player = await ctx.dao.role.getOtherInfoAndBattleSet({ servid: sid, rid }, 'wangpvp');
        if (player && player.battleset.length == 0) {
            // 取防守阵容
            let role = await ctx.dao.role.findOne({ _id: rid }, { act: 0, deviceid: 0, mood: 0, cdkeys: 0, special: 0, friends: 0 });
            let bset = await role.getBattleSet('pvpdef');
            player.wangbset = [bset];
            ctx.body.push(player);
            continue;
        }
        player.wangbset = player.battleset;
        delete player.battleset;
        ctx.body.push(player);
    }
}
