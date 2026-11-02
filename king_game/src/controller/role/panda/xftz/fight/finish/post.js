
'use strict'

module.exports = exports = async (ctx) =>{
	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');

	let id = battle.mapid;
	const config = ctx.CONFIG[id];
	ctx.assert(config, 'invalid floor');

	await battle.cal();
	ctx.body = {result: battle.result};
	// 战斗结算
	if (ctx.body.result.ret === 'win') {
		let rewards = [];
		// 通关奖励
		for (let item of config.ITEMS) {
			rewards[item.GSID] = rewards[item.GSID] || 0;
			rewards[item.GSID] += item.COUNT;
		}
		ctx.CACHE.floor[id] = 1;
		ctx.role.markModified('panda.xftz');
		
		// 关卡首胜判断
		let info = await ctx.dao.c_xftz.findOne({floor: id, season: ctx.CACHE.season, servid: ctx.role.servid});
		if(!info){
			ctx.body.first = 1;
			for (let item of config.FIRST) {
				rewards[item.GSID] = rewards[item.GSID] || 0;
				rewards[item.GSID] += item.COUNT;
			}

			let player = {};
            player.level = ctx.role.level;
            player.rname = ctx.role.name;
            player.headid = ctx.role.headid;
            player.rid = ctx.role.rid;
            player.frameid = ctx.role.frameid;
			console.log("xftz",id,player,ctx.CACHE.season)
			let re = new ctx.dao.c_xftz({floor: id, player: player, season: ctx.CACHE.season, servid: ctx.role.servid});
			await re.save();
		}
		let items = [];
		for (let gsid in rewards) {
			const count = rewards[gsid];
			if (count < 1) continue;
			items.push({ GSID: parseInt(gsid), COUNT: count });
		}
		ctx.role.addItemsNoSave(items, {main: 'xftz', sec: 'win_'+id});
		await ctx.role.save();

		ctx.body.items = items;
	}
}
