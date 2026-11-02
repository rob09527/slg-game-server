'use strict'

module.exports = exports = async (ctx, next) =>{
	const index = parseInt(ctx.request.body.index);
    let reward = ctx.config.REWARD[index];
    ctx.assert(reward,' index invalid');
    ctx.assert(ctx.role.getProp(reward.SIGN) == 0,'already took');
    ctx.assert(ctx.role.panda.pfxp.score >= reward.SCORE, 'need more score');
    ctx.assert(!ctx.role.panda.pfxp.get[index], 'already get reward');

    ctx.role.addItemsNoSave([...reward.ITEMS,{GSID:reward.SIGN,COUNT:1}]);

    let signs = [];
    ctx.config.REWARD.forEach(({SIGN})=>{
        let COUNT = ctx.role.getProp(SIGN);
        if (COUNT > 0) {
            signs.push({GSID:SIGN, COUNT});
        }
    })
    if (signs.length == ctx.config.REWARD.length) {
        ctx.role.castItemsNoSave(signs);
    }
    ctx.role.panda.pfxp.get[index] = 1;
    ctx.role.panda.pfxp.get.count++;
    if(ctx.role.panda.pfxp.get.count == ctx.config.REWARD.length) {
        ctx.role.panda.pfxp.get = {count:0};
        let i = ctx.config.REWARD.length - 1;
        ctx.role.panda.pfxp.score -= ctx.config.REWARD[i].SCORE;
    }
    ctx.role.markModified('panda.pfxp');
    await ctx.role.save();
    ctx.body = {
        score: ctx.role.panda.pfxp.score,
        reward: reward.ITEMS
    }
}