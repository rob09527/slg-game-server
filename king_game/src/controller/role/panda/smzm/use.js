"use strict"

module.exports = exports = async function (ctx, next) {
	let [ok, season, id, stime, etime] = ctx.role.isInPanda("SMZM");
    if (!ok) {
        ctx.body = {time:-1}
        return
    }
    [ok,season] = ctx.role.isInPanda("SMFL");
    if (!ok) {
        ctx.body = {time:-1}
        return
    }
    if (!ctx.role.panda.smzm) {
        let init = global.gameconfig.smzm.SMZM.INITGENERAL.map(info=>info);
        ctx.role.panda.smzm = {general:init, val:0, freetime:0, smflseason:0, smflrecord:[], ljczmoney:0, ljczrecord:[], smlbrecord:[], xlbjrecord:[] }
        ctx.role.markModified("panda.smzm");
        await ctx.role.save();
    }
    if (ctx.role.panda.smzm.smflseason != season) {
        await ctx.pandapoint("EVENT_LOGIN", ctx.role);
    }
    ctx.etime = etime;
    await next();
}