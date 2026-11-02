
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.body = {};
	await next();
	ctx.zhdpoint("DBRW", ctx.role, 90582); // 夺宝任务-日常副本挑战
	await global.dao.warorder.point(ctx.role, 90569);  // 卧龙战令-每日战役
	let is_farm = ctx.path.includes('farm');
	ctx.role.zhenbaoMissionInvoke({ missionName: 'CHALLENGE_BIGBATTLE' }).catch(console.error);
	if (!is_farm && ctx.body.result.ret !== 'win') {
		ctx.role.save().catch(console.error);
		return;
	};
	// 挑战胜利/扫荡 结算
	let mark = global.gameconfig.others.BIGBATTLE.CASTTYPE[ctx.config.TYPE - 1];
	ctx.assert(mark, 'invalid type');

	const free_mark = global.gameconfig.others.BIGBATTLE.FREE[ctx.config.TYPE - 1];
	ctx.assert(free_mark, 'invalid freemark');
	const count = ctx.role.getItems(free_mark.GSID).count;
	if (count < free_mark.COUNT) {
		ctx.role.addItemsNoSave({ gsid: free_mark.GSID, count: 1 });
	} else {
		const times = ctx.role.getItems(mark).count;
		const limit = global.gameconfig.vip.BIGBATTLE[ctx.role.vip];
		ctx.assert(limit > times, 'no more');
		ctx.role.castItemsNoSave({ gsid: 38005, count: 50 }, { main: 'bigbattle', sec: 'chapter' });
	}
	ctx.role.addItemsNoSave(mark);

	ctx.body.times = 1;
	ctx.body.rewards = [].append(ctx.config.ITEMS);
	if (is_farm) {
		if (ctx.random.hit(ctx.config.RATIO, 1000)) {
			let times = ctx.random.between(2, ctx.config.TIMES);
			ctx.body.times = times;
			ctx.body.rewards = ctx.body.rewards.map(function (item) {
				let { COUNT: ic, GSID } = item;
				let COUNT = times * ic;
				return {
					COUNT,
					GSID
				};
			})
		}
		// for (let i = 0; i < ctx.config.TIMES; i++){
		// 	if (!ctx.random.hit(ctx.config.RATIO, 1000)) break;
		// 	ctx.body.times++;
		// 	ctx.body.rewards.append(ctx.config.ITEMS);
		// }
	}
	ctx.body.rewards = ctx.body.rewards.arrange();

	// 夏季加成
	// let {season} = ctx.bseason();
	// if (season == 2) {
	// 	const add = global.gameconfig.others.BATTLESEASON.VALS[season - 1];
	// 	ctx.body.rewards = ctx.body.rewards.map(function (item) {
	// 		let {COUNT: count} = item;
	// 		count = count * (1 + add / 100);
	// 		item.COUNT = Math.floor(count);
	// 		return item;
	// 	})
	// }
	// // 日理万机埋点
	// let type = ctx.config.TYPE
	// let rlwjMark = 0
	// if(type === 1) { // 铜钱战役
	// 	rlwjMark = 90404
	// }else if(type === 2) { // 经验战役
	// 	rlwjMark = 90418
	// }else if(type === 3) { // 碎片战役
	// 	rlwjMark = 90406
	// }
	// if (rlwjMark) await ctx.rlwj({ mark: rlwjMark, role: ctx.role })
	ctx.role.addItemsNoSave(ctx.body.rewards, { main: 'bigbattle', sec: 'chapter' });
	await ctx.role.missionInvoke('DAZHANYI_DAILY_HISTORY').save();
	ctx.role.dispatchEvent('EVENT_DAZHANYI', 1, { ret: ctx.config.TYPE });
}
