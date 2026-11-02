'use strict'

// 连续充值
module.exports = async function(ctx, next) {
	let { type } = ctx.request.body;
	ctx.assert(ctx.zhdpoint("ISZHD", type), "fn freeze");
	type = type.toLowerCase();
	
	ctx.lxljcz = type;

	ctx.config = global.gameconfig.zhd_newhero[ctx.lxljcz.toUpperCase()] || global.gameconfig.zhd[ctx.lxljcz.toUpperCase()];
	ctx.assert(ctx.config, "invalid config"+type);

	const { ITEMS } = ctx.config;
	if (!ctx.role[ctx.lxljcz]) {
		ctx.role[ctx.lxljcz] = {task:[], all:{got:0}};
		ctx.role.markModified(`${ctx.lxljcz}`);
		ctx.save= true;
	}
	if (ctx.role[ctx.lxljcz].task.length != ITEMS.length) {
		let task = [];
		for (let i = 0; i < ITEMS.length; i++) {
			let info = ctx.role[ctx.lxljcz].task[i] || {num:0, got:0, time:0};
			task.push(info);
		}
		ctx.role[ctx.lxljcz].task = task;
		ctx.role.markModified(`${ctx.lxljcz}`);
		ctx.save= true;
	}
	await next();
	if (ctx.save) {
		await ctx.role.save();
	}
}