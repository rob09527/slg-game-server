
'use strict'

module.exports = exports = async function (ctx, next) {
	let save = false;
	// 每日购买次数刷新
	let today = new Date().setHours(0,0,0,0);
	if(today != ctx.CACHE.base.update){
		ctx.CACHE.base.update = today;
		ctx.CACHE.base.num = 0;
		save = true;
		for (let i in ctx.CONFIG.shop) {
			let info = ctx.CONFIG.shop[i];
			if (info.TYPE == 1 && ctx.CACHE.shop[info.ID]) {
				ctx.CACHE.shop[info.ID] = 0;
			}
		}
	}
	let events = [];
	let num = 0;
	for (const key in ctx.CACHE.event) {
		if(key != "num"){
			num++;
		}
		let data = ctx.CACHE.event[key];
		let info = {
			key: key,
			id: data.id,
			type: data.type,
			info: ctx.EVENT_INFO(ctx, data)
		}
		events.push(info);
	}
	if(num != ctx.CACHE.base.event) {
		ctx.CACHE.base.event = num;
		save = true;
	}
	if(save){
		ctx.role.markModified('panda.gjxb');
		await ctx.role.save();
	}
	let infos = {
		base: ctx.CACHE.base,
		shop: ctx.CACHE.shop,
		fund: ctx.CACHE.fund,
		events
	}
	ctx.body = {
		info: infos,
		cfg: ctx.CONFIG,
	}
}