'use strict'

// vip折扣
module.exports = async function(ctx, next) {
	for (let index = 1; index <= 4; index++) {
		if (ctx.zhdpoint("ISZHD", 'vipzksd'+index)) {
            ctx.vipzksd = `vipzksd${index}`;
			break;
		}
	}
	ctx.assert(ctx.vipzksd, "fn freeze");

	ctx.config = global.gameconfig.zhd_newhero[ctx.vipzksd.toUpperCase()] || global.gameconfig.zhd[ctx.vipzksd.toUpperCase()];
	ctx.assert(ctx.config, "invalid "+ctx.vipzksd);

	const { ITEMS } = ctx.config;
	if (!ctx.role[ctx.vipzksd]) {
		ctx.role[ctx.vipzksd] = {record:[], time:0};
		ctx.role.markModified(`${ctx.vipzksd}`);
		ctx.save = true;
	}
    ctx.record = ctx.role[ctx.vipzksd];
    let now = new Date().setHours(0,0,0,0);
    if (now != ctx.record.time) {
        ctx.record.time = now;
        ITEMS.forEach((value, index) => {
            if (value.TYPE == 1) {
                ctx.record.record[index] = 0;
            }
        });
		ctx.role.markModified(`${ctx.vipzksd}`);
		ctx.save = true;
    }
	await next();
	if (ctx.save) {
		await ctx.role.save();
	}
}