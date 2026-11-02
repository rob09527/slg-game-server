
'use strict'
// 获取封地野外信息
module.exports = exports = async ctx => {
    // 判断领取日奖励的时间
    ctx.assert(ctx.manor, 'invalid manor');
    const b_newmanor_config = global.gameconfig.battlenewmanor
    let _enemy = ctx.manor.monsters.map(e => {
        return {
            ...e, bset: b_newmanor_config[e.id]
        }
    })
    ctx.body = {
        lv: ctx.manor.monsterlv,
        boss: ctx.manor.bossinfo[0],
        enemy:_enemy
    };
}
