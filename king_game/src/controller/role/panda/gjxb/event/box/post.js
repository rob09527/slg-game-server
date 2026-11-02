
'use strict'

module.exports = exports = async (ctx) =>{
	let {eventid} = ctx.request.body;
	const event = ctx.CACHE.event[eventid];
	ctx.assert(event, 'invalid event');
	const file = 'panda_gjxb_box'+ctx.FILEID;
	const cfg = global.gameconfig[file];
	ctx.assert(cfg, 'invalid box config');
	const config = cfg[event.id];
	ctx.assert(config, 'invalid box config');

	ctx.body = {};
	let items = [];
	// 奖励
	for (let item of config.items) {
		if(Math.floor(Math.random() * 10000) <= item.W){
			items.push({GSID: item.GSID, COUNT: item.COUNT})
		}
	}
	items.length && ctx.role.addItemsNoSave(items, {main: 'gjxb', sec: 'event_'+event.id});
	ctx.body.items = items;
	
	let mapid = event.map;
	delete ctx.CACHE.event[eventid];
	ctx.CACHE.base.event--;

	// 再件在触发
	if(Math.floor(Math.random() * 10000) <= config.odds){
		let map_config = ctx.CONFIG.map[mapid];
		ctx.body.events = ctx.TRIGGER_EVENT(ctx, 1, map_config);
	}

	ctx.role.markModified('panda.gjxb');
	await ctx.role.save();
}
