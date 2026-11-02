'use strict'

module.exports = exports = async (ctx, next)=>{
    let { type } = ctx.request.body;
    let config = global.gameconfig.commonPeiZhi[type];
    ctx.assert(config,'invalid config');
    ctx.assert(ctx.role.getProp(config[3][0]) < config[1][0], 'number limit');
    let drops = global.gameconfig.commonPeiZhi.DROPS[config[2][0]];
    ctx.assert(drops,'no drops');
    ctx.body = [];
    drops.forEach(drop=>{
        if (!ctx.random.hit(drop.RATE,100)) return;
        ctx.body.push({GSID:drop.GSID, COUNT:drop.COUNT});
    })
    ctx.role.addItemsNoSave(ctx.body);
    await ctx.role.save();
}