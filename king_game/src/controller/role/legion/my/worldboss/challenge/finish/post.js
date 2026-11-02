
'use strict'
// 军团世界boss战斗完成
module.exports = exports = async (ctx, next) => {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
    ctx.assert(battle, 'invalid battleid');
    await battle.cal();
    let { result: ret } = battle;
    const { rlosthp: damge } = ret;
    ctx.bossid = battle.mark;

    ctx.current_damage = damge;

    ctx.body = {
        result: ret,
        damge
    };
}
