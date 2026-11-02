"use strict"

module.exports = exports = async (ctx, next)=>{
    let {index} = ctx.request.body;
    let info = ctx.config.TYPE[index];
    ctx.assert(info,"no info");
    let count = ctx.role.getProp(info.MARK);
    ctx.assert(count < info.LIMIT,'no times');
    let COST = ctx.config.COST[index];
    ctx.assert(COST && COST[count],'no cost');
    let costInfo = COST[count];
    if (costInfo.COUNT > 0) {
        ctx.assert(ctx.role.getProp(costInfo.GSID) >= costInfo.COUNT,'not enough');
    }
    let reCount = parseInt((ctx.role.level * info.XISHU + info.COUNT) * (1 + ctx.config.LEGION[ctx.legionLevel] + ctx.config.ANIMAL[ctx.shoujie]));
    let reward = [{GSID:info.GSID, COUNT:reCount}]
    ctx.role.addItemsNoSave([...reward,{GSID:info.MARK, COUNT:1}]);
    if (costInfo.COUNT) {
        ctx.role.castItemsNoSave(costInfo);
    }
    await ctx.role.save();
    ctx.body = {
        reward
    }
}