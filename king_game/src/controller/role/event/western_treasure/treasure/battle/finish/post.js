"use strict"

module.exports = async function (ctx, next) {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid })
    ctx.assert(battle, 'invalid battleid');
    await battle.cal()
    let { result } = battle
    if (result.ret == "win") {
        await ctx.wt.guardDeath(ctx.index, ctx.sub)
    }
    ctx.body = {
        result,
        damge: result.rlosthp,
    }
}