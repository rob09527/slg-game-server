
'use strict'
// 请求战斗接口(获取怪物信息)
module.exports = exports = async (ctx, next) => {
    let { index } = ctx.request.body;
    let boss = {};
    let enemy = {};
    if (index >= 0) {
        // 小怪
        let monster = ctx.manor.monsters[index];
        ctx.assert(monster, 'invalid index');
        let bset = global.gameconfig.battlenewmanor[monster.id];
        ctx.assert(bset,'invalid bset')
        enemy = bset
    } else {
        // boss
        let bossInfo = ctx.manor.bossinfo;
        let bset = global.gameconfig.battlenewmanorboss[bossInfo[0].id];
        ctx.assert(bset, 'bset config err');
        boss = {
            bset,
            maxhp:bossInfo[0].maxhp,
            lastdamage: bossInfo[0].lastdamage,
            nowhp: bossInfo[0].nowhp,
            bossid: bossInfo[0].id
        }
    }
    ctx.body = {
        boss,
        enemy
    }

}
