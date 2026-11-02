
'use strict'

module.exports = exports = async (ctx) =>{
	let {eventid, opt = 0} = ctx.request.body;
	const event = ctx.CACHE.event[eventid];
	ctx.assert(event, 'invalid event');
	const file = 'panda_gjxb_select'+ctx.FILEID;
	const cfg = global.gameconfig[file];
	ctx.assert(cfg, 'invalid select config');
	const config = cfg[event.id];
	ctx.assert(config, 'invalid select config');
	let item = config.items[parseInt(opt)];
	ctx.assert(item, 'invalid item');

	ctx.body = {};
	// 奖励
	let items = [];
	let count = item.COUNT;
	if (Array.isArray(count)) count = ctx.random.between(count[0], count[1]);
	if (item.R) count += ctx.role.level * item.R;
	items.push({GSID: item.GSID, COUNT: count})

	ctx.role.addItemsNoSave(items);
	ctx.body.items = items;

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
