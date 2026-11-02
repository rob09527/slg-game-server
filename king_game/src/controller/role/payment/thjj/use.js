"use strict";

const moment = require("moment");

// 特惠基金（祈福基金、春节基金）
module.exports = async function (ctx, next) {
    let { actIndex = 0 } = ctx.request.body;
    if (actIndex == 0) actIndex = "";
    ctx.thjj = `thjj${actIndex}`
    ctx.assert(ctx.zhdpoint("ISZHD", ctx.thjj), 'not open');
    ctx.config = global.gameconfig.zhd[ctx.thjj.toUpperCase()];
    ctx.assert(ctx.config, "invalid actIndex");
    let [start] = global.config.ZHD[ctx.thjj.toUpperCase()];
    ctx.diff = moment().diff(moment(start), "day");
    const { COND, ITEMS } = ctx.config;
    ctx.diff = Math.min(ctx.diff, ITEMS.length - 1);
    ctx.cond = COND.map(co => {
        let [spe, type] = co.split(".");
        return ctx.role[spe][type] > 0 ? 1 : 0;
    });
    await next();
}