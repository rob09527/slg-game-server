
'use strict'

module.exports = exports = async function (ctx, next) {
    let {stage} = ctx.request.body;
    ctx.assert(ctx.mongoFind.stage >= stage, '132');
    ctx.assert(!ctx.CACHE.flag[stage],'130');
    let info = ctx.CONFIG.stageReward[stage];
    ctx.assert(info,'129');
    ctx.assert(info.SCORE <= ctx.mongoFind.score,'131');
    ctx.assert(info.ITEMS,'129');
    let reward = info.ITEMS.arrange();
    ctx.role.addItemsNoSave(reward);

    ctx.body = {reward};
    ctx.CACHE.flag[stage] = true;
    ctx.save = true;
}