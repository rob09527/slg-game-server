
'use strict'

const moment = require('moment');
const ms = require('ms');

module.exports = exports = async function (ctx, next) {
	if (!ctx.cache) ctx.cache = new ctx.dao.c_sppack({rid: ctx.role._id, type: ctx.params.cycle});
	if (Date.now() > ctx.cache.end) {	// refresh
		// cycle - 刷新间隔
		let cycle = ctx.params.cycle === 'weekly'? 7: 30;
		cycle = ms(`${cycle} day`);
		// createDayStart - 角色创建当天00:00
		let createDayStart = moment(ctx.role.create).startOf('day').valueOf();
		// del - 第几次刷新
		const del = (Date.now() - createDayStart) / cycle;
		ctx.cache.end = createDayStart + Math.ceil(del) * cycle;
		ctx.cache.index = Math.floor(del);
		let config = global.gameconfig['sppack'+ctx.params.cycle]
		ctx.assert(config, 'invalid cycle');
		config = config[Math.floor(ctx.cache.index % config.length)];
		ctx.assert(config, 'invalid config');
		ctx.cache.items = config.map(function (info) {
			let tmp = {price: info.PRICE, buytime: info.LIMIT, items: info.ITEMS, name: info.NAME
			,path:info.PATH,vip:info.VIP,lock:info.LOCK,mark:info.MARK, level:info.LEVEL,exp: info.EXP};
			return tmp;
		})
		await ctx.cache.save();
		// 清理月礼包和周礼包的免费礼包标记
		if (ctx.params.cycle === 'weekly' && ctx.role.getProp(93351) === 1){
			ctx.role.castItemsNoSave({gsid:93351,count:1})
		} else if (ctx.params.cycle === 'monthly' && ctx.role.getProp(93352) === 1) {
			ctx.role.castItemsNoSave({gsid:93352,count:1})
		}
		await ctx.role.save();
	}
	else {
		let config = global.gameconfig['sppack'+ctx.params.cycle]
		config = config[Math.floor(ctx.cache.index % config.length)];
		if (config && config.length > ctx.cache.items.length) {
				for (let i = ctx.cache.items.length; i < config.length; i++) {
						let info = config[i];
						ctx.cache.items.push({price: info.PRICE, buytime: info.LIMIT, items: info.ITEMS, name: info.NAME
								,path:info.PATH,vip:info.VIP,lock:info.LOCK,mark:info.MARK, level:info.LEVEL,exp: info.EXP})
				}
				await ctx.cache.save();
		}
	}
	ctx.body = {end: ctx.cache.end, items: ctx.cache.items};
}