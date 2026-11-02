"use strict"

// 购买战令等级
module.exports = async function (ctx, next) {
    const {
        level = 1, // 购买的等级
    } = ctx.request.body;
    ctx.assert(level > 0, "invaild not level");
    const { get, cost, buynum = 0 } = ctx.war.levelbuy;
    const costCoy = cost.map(({GSID,COUNT})=>{
        return {
            GSID,
            COUNT:COUNT*level
        }
    });
    ctx.role.castItemsNoSave(costCoy);
    const { WDMARK } = global.gameconfig.warorder;
    const reward = [{ GSID: WDMARK, COUNT: get * level }];
    ctx.role.addItemsNoSave(reward);
    ctx.war.levelbuy.buynum = buynum + level;
    ctx.war.markModified("levelbuy.buynum");
    await ctx.war.save();
    await ctx.role.save();
    ctx.body = reward;
    ctx.zhdpoint("WARORDER_RED", ctx.role,ctx.war);
}