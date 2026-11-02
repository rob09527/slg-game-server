
'use strict'

module.exports = exports = async (ctx) =>{
	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	const eventid = battle.mapid;
	const event = ctx.CACHE.event[eventid];
	ctx.assert(event, 'invalid event');
	const file = 'panda_gjxb_fight'+ctx.FILEID;
	const cfg = global.gameconfig[file];
	ctx.assert(cfg, 'invalid fight config');
	const config = cfg[event.id];
	ctx.assert(config, 'invalid fight config');

	const id = event.id;
	let mapid = event.map;
	delete ctx.CACHE.event[eventid];
	ctx.CACHE.base.event--;

	await battle.cal();
	ctx.body = {result: battle.result};
	// 战斗结算
	if (ctx.body.result.ret === 'win') {
		let items = [];
		// 奖励
		for (let item of config.items) {
			if(Math.floor(Math.random() * 10000) <= item.W){
				items.push({GSID: item.GSID, COUNT: item.COUNT})
			}
		}
		items.length && ctx.role.addItemsNoSave(items, {main: 'gjxb', sec: 'event_'+id});
		ctx.body.items = items;
		// 再件在触发
		if(Math.floor(Math.random() * 10000) <= config.odds){
			let map_config = ctx.CONFIG.map[mapid];
			ctx.body.events = ctx.TRIGGER_EVENT(ctx, 1, map_config);
		}
	}

	ctx.role.markModified('panda.gjxb');
	await ctx.role.save();
}
