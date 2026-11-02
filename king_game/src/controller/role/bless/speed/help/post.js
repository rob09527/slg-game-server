'use strict'

module.exports = exports = async (ctx, next)=>{
    ctx.assert(ctx.role.legion, "no join legion");
    ctx.assert(ctx.role.bless.speed == 0, "already speed");
    ctx.role.bless.speed = 1;
    ctx.role.markModified("bless.speed");
    await ctx.role.save();
    ctx.body = {};
}