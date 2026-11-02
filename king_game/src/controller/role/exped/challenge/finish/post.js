
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');

	await battle.cal();
	let ret = battle.result;

	ctx.body = {result: ret};	
	let index = ctx.role.getItems(90153).count;
	// save player hp percent
	for (const pos in ret.lper){
		let {guid} = battle.player.team[pos];
		ctx.cache.hp[guid] = parseInt(ret.lper[pos]);
	}
	ctx.cache.markModified('hp');
	// save targets hp percent
	for (const pos in ret.rper){
		let general = ctx.cache.map[index].battleset.team[pos];
		if (!general) continue;
		ctx.cache.map[index].battleset.team[pos].hppercent = ret.rper[pos];
	}
	ctx.cache.markModified('map.'+index);

	// wish clean
	ctx.cache.wish = [0, 0, 0];
	ctx.cache.markModified('wish');

	if (ret.ret === 'win') {
		ctx.body.drop = [];
		ctx.body.drop.append(ctx.config.ITEMS);
		// coin
		const count = ctx.random.between(ctx.config.COIN[0], ctx.config.COIN[1]);
		ctx.body.drop.push({GSID: 38009, COUNT: count});
		ctx.role.addItemsNoSave(ctx.body.drop, 'exped');

		if (ctx.config.TYPE > 1) {	// 翻牌奖励(仅type > 1)
			ctx.body.reward = [];
			const config_reward = global.gameconfig.expedreward.filter(function (item) {
				return ctx.role.level >= item.LV[0] && ctx.role.level <= item.LV[1];
			});
			ctx.assert(config_reward.length > 0, 'invalid reward');
			const rates = config_reward.deepMap('CHANCE');
			while(ctx.body.reward.length < 3){
				const item = config_reward[ctx.random.inweight(rates)];
				ctx.assert(item, 'invalid item');
				ctx.body.reward.push({gsid: item.GSID, count: ctx.random.between(item.COUNT[0], item.COUNT[1])});
			}
			ctx.body.reward[0].real = true;
			// 霸王特权
			if (ctx.role.special.bw > Date.now()) {
				ctx.body.reward[1].real = true;
				ctx.body.reward[2].real = true;
			}
			const items = ctx.body.reward.filter(function (item) {
				return item.real;
			})
			ctx.role.addItemsNoSave(items, 'exped');
		}
		// 通关标记
		ctx.role.addItemsNoSave({gsid: 90153, count: 1});
		// 祝福清零
		for (let mark of global.gameconfig.others.EXPEDITION.ZF_MARK){
			const count = ctx.role.getItems(mark).count;
			if (count > 0) {
				ctx.role.others[mark].count = 0;
				ctx.role.markModified('others.'+mark);
			}
		}
		// 远征试炼活动标记
		ctx.role.missionInvoke('YUANZHENG', index + 1);
	}
	await ctx.cache.save();
	await ctx.role.save();
}