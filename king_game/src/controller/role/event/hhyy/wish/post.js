"use strict"

// 一键许愿
module.exports = async function (ctx, next) {
    const { ITEMS } = global.gameconfig.zhd[ctx.zhdpoint("HHYYCFG")];
    const curperoid = ctx.zhdpoint("HHYYCOMMONDATE");
    ctx.assert(curperoid >= 0, "not_start");
    const { START, END } = ITEMS[curperoid];
    ctx.assert(Date.in(Date.parse(START), Date.parse(END)), "not_wish_time")
    let servname = ctx.role._gameserv.name;
    const { ok } = await ctx.commonsend('/activityinfo/fmoon/moon/wish', {
        servid: ctx.role.servid,
        rid: ctx.role.i(),
        vip: ctx.role.vip,
        name: ctx.role.name,
        peroid: curperoid,
        servname,
    });
    ctx.assert(ok, "wished");
    const tasks = ITEMS[curperoid]
    ctx.role.addItemsNoSave(tasks.WREWARD);
    await ctx.role.save();
    ctx.body = tasks.WREWARD;
}