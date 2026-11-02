'use strict'
//解锁
module.exports = exports = async (ctx, next) => {
    let { bid, } = ctx.request.body;
    let { BUILD_MAX } = global.gameconfig.newmanor;
    let config = BUILD_MAX[bid]
    let COUNT = ctx.role.getProp(config.KEY);
    ctx.assert(COUNT == 0, 'Already unlocked');
    ctx.role.addItemsNoSave({ gsid: config.KEY, count: 1 });
    ctx.role.castItemsNoSave(config.ITEM);
    await ctx.role.save();
    ctx.body = "success"
}
