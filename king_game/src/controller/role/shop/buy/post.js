
'use strict'

const moment = require('moment');

module.exports = exports = async (ctx, next) => {
	ctx.assert(ctx.shop_cache && ctx.shop_cache.goods, 'process error');
	const index = parseInt(ctx.request.body.index);
	let num = ctx.request.body.num || 1;
	num = parseInt(num);

	let good = ctx.shop_cache.goods[index];
	ctx.assert(!ctx.shop_cache.lock, 'no shop'); // 锁定的商店
	ctx.assert(good, 'invalid goods');
	ctx.assert(good.BUYTIME != 0, 'no more');
	/**
	 *  2、有限购次数上限的商品，自选数量上限=限购次数上限
	 *	3、没有限购次数上限的商品，自选数量上限=99
	 */
	if (good.BUYTIME == -1) {
		ctx.assert(num <= 99, 'no more');
	} else {
		ctx.assert(num <= good.BUYTIME, 'no more');
	}
	let price = parseInt(good.PRICE * num);
	let count = parseInt(num * good.COUNT);
	ctx.body = [{ GSID: good.GSID, COUNT: count }];

	let cast_list = [
		{ GSID: good.COIN, COUNT: price }
	];

	ctx.role.castItemsNoSave(cast_list, { main: 'shop', sec: ctx.shop_cache.type });
	ctx.role.addItemsNoSave(ctx.body, { main: 'shop', sec: ctx.shop_cache.type });

	if (good.BUYTIME > 0) good.BUYTIME -= num;
	ctx.shop_cache.markModified('goods');
	await global.dao.warorder.point(ctx.role, 90563);  // 卧龙战令-商店购买商品
	ctx.role.missionInvoke('SHOP_BUY_DAILY');
	await Promise.all([ctx.shop_cache.save(), ctx.role.save()]);
	let time = moment().format('YYYY-MM-DD HH:mm:ss');
	// 打印商店购买消耗
	for (let { GSID, COUNT } of cast_list) {
		let params = [
			// 识别主前缀
			'SHOPBUY',
			// 识别次前缀
			'CST',
			// 商店类型
			ctx.request.body.shop.toUpperCase(),
			// 服务器id
			ctx.role.servid,
			// 角色uid
			ctx.role.uid,
			// 货币GSID
			GSID,
			// 货币数量
			COUNT,
			// 征战进度
			ctx.role.maxmapid,
			// 打印时间
			time,
		]
		console.log.apply(null, params);
	}
	// 打印商店购买获得
	for (let { GSID, COUNT } of ctx.body) {
		let params = [
			// 识别主前缀
			'SHOPBUY',
			// 识别次前缀
			'GET',
			// 商店类型
			ctx.request.body.shop.toUpperCase(),
			// 服务器id
			ctx.role.servid,
			// 角色uid
			ctx.role.uid,
			// 货币GSID
			GSID,
			// 货币数量
			COUNT,
			// 征战进度
			ctx.role.maxmapid,
			// 打印时间
			time,
		]
		console.log.apply(null, params);
	}
	// 打印招募消耗元宝数量日志
	ctx.khlog.ybcastprint('shop', ctx.role.uid, { GSID: good.COIN, COUNT: price });
}
