'use strict'

module.exports = exports = async (ctx) =>{
    ctx.assert(ctx.role.getProp(90692) == 0,'already took');
    ctx.body = {reward:[...global.gameconfig.vip.VIPDAILY[ctx.role.vip]]};

    ctx.role.addItemsNoSave([...ctx.body.reward,{GSID:90692, COUNT:1}]);
    await ctx.role.save();
}