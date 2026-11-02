'use strict'

module.exports = exports = async (ctx, next) =>{
    let { FREE, POOL, COST:cost, REWARD:reward, GENERAL } = ctx.config;
    let free = Date.now() - ctx.role.panda.pfxp.free;
    if (free >= FREE * 3600 * 1000) free = 0;
    else free = ctx.role.panda.pfxp.free + FREE * 3600 * 1000;

    let items = POOL.map(({GSID,COUNT})=> {return {GSID,COUNT}})
    ctx.body = {
        free,
        items,
        cost,
        reward,
        time: ctx.etime,
        score: ctx.role.panda.pfxp.score,
        general:GENERAL,
    }
    if (ctx.mark.save) {
        await ctx.role.save();
    }
}