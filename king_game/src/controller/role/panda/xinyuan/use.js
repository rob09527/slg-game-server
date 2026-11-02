"use strict"

module.exports = exports = async function (ctx, next) {
	let [ok, season] = ctx.role.isInPanda("XINYZM");
    if (!ok) {
        ctx.body = {time:-1}
        return
    }
    [ok,season] = ctx.role.isInPanda("XINYFL");
    if (!ok) {
        ctx.body = {time:-1}
        return
    }
    if (!ctx.role.panda.xyzm) {
        ctx.role.panda.xyzm = {general:[], val:0, freetime:0, xyflseason:0, xyflrecord:[], ljczmoney:0, ljczrecord:[], xylbrecord:[], xlbjrecord:[] }
        ctx.role.markModified("panda.xyzm");
    }
    if (ctx.role.panda.xyzm.xyflseason != season) {
        await ctx.pandapoint("EVENT_LOGIN", ctx.role);
    }
    await next();
}