'use strict'

module.exports = exports = async (ctx, next) =>{
    let { FREE, POOL, COST, REWARD } = ctx.config;
	const times = parseInt(ctx.request.body.times) || 1;
    let cost = COST.find(value=> value.TIMES == times)
    ctx.assert(cost, "cost info error");
    let free = false;
    if (times == 1 && Date.now() - ctx.role.panda.pfxp.free >= FREE * 3600 * 1000) {
        free = true;
        ctx.role.panda.pfxp.free = Date.now();
    } else {
        ctx.assert(ctx.role.getProp(cost.GSID) >= cost.COUNT, "need prop");
    }

    ctx.body = {reward : [], pos:0};
    for (let i = 0; i < times; i++) {
        const rates = POOL.deepMap('CHANCE');
        let pos = ctx.random.inweight(rates);
        let item = POOL[pos];
        ctx.body.reward.push({GSID:item.GSID, COUNT:item.COUNT});
        if (i == 0) ctx.body.pos = pos;
    }

    if (!free) ctx.role.castItemsNoSave([{GSID:cost.GSID, COUNT:cost.COUNT}], 'pfxp');
    ctx.role.panda.pfxp.score += cost.SCORE;
    ctx.role.markModified('panda.pfxp');

	ctx.role.addItemsNoSave(ctx.body.reward, 'pfxp');
    await ctx.role.save();
}