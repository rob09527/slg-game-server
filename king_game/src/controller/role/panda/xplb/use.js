'use strict'

module.exports = exports = async (ctx, next) =>{
    let [ok, season, id, stime, etime] = ctx.role.isInPanda("XPLB");
    if (!ok) {
        return ctx.body = {time:-1}
    }
    if (!ctx.role.panda.xplb || ctx.role.panda.xplb.season != season) {
        ctx.role.panda.xplb = {record:[],season}
        ctx.role.markModified("panda.xplb")
        await ctx.role.save();
    }
    ctx.record = ctx.role.panda.xplb.record;
    ctx.config = global.gameconfig[`xplb${id}`];
    ctx.assert(ctx.config,"xplb config invalid")
    ctx.etime = etime;
    ctx.id = id;
    await next();
}