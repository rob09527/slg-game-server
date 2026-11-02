'use strict'

module.exports = exports = async (ctx, next) =>{
    let [ok, season, id, stime, etime] = ctx.role.isInPanda("PFXP");
    if (!ok) {
        return ctx.body = {time:-1}
    }
    if (!ctx.role.panda.pfxp) {
        ctx.role.panda.pfxp = {free:0, id:id, score:0, get:{count:0}};
        ctx.role.markModified("panda.pfxp");
    }
    ctx.mark = {save:false};
    if (ctx.role.panda.pfxp.id != id) {
        await ctx.pandapoint("EVENT_LOGIN", ctx.role, ctx.mark);
    }
    ctx.etime = etime;
    ctx.config = global.gameconfig[`pfxppool${id}`];
    ctx.assert(ctx.config, 'config not exists');
    await next();
}