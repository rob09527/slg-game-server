
'use strict'

module.exports = exports = async function (ctx, next) {
    ctx.config = global.gameconfig.deftiny;
    ctx.assert(ctx.config,'config error');
    ctx.tian = ctx.role.destiny;
    ctx.assert(ctx.tian,'destiny error');
    ctx.tian.temprefersh = ctx.tian.temprefersh || {};
    await next();
    if (ctx.role.getProp(ctx.config.COST.FIRSTGSID) == 0) {
        ctx.role.addItemsNoSave({GSID:ctx.config.COST.FIRSTGSID, COUN:1});
    }
    await ctx.role.save();
}