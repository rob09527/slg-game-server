"use strict"

const moment = require("moment");

module.exports = async function(ctx, next) {
    const config = global.gameconfig.shier;
    ctx.assert(config,"config not exists");
    const days = moment(moment().format('YYYY-MM-DD')).diff(moment(ctx.role.create).format('YYYY-MM-DD'),'days');
    const tm = Math.floor(days / config.length);
    const idx = Math.floor(days % config.length);
    const d = ctx.role.shier || {}
    if (d.tm != tm || d.idx != idx) {
        ctx.role.shier = {
            tm: tm,
            idx: idx,
            buytime: 0
        };
		ctx.role.markModified('shier');
		await ctx.role.save();
    }
    ctx.RECORD = ctx.role.shier;
    ctx.CONFIG = config[ctx.RECORD.idx];
    await next()
}