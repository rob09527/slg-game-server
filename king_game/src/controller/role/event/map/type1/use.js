
'use strict'

module.exports = async (ctx, next) =>{
	let {
		id: stationid,
		hash,
	} = ctx.request.body;
	let event = await ctx.dao.mapevent.findOne({rid: ctx.role._id, stationid});
	ctx.assert(event, 'event nexist');
	ctx.assert(event._id.toString() === hash, 'verify fail');
	let {
		event: {
			type,
			id,
		},
	} = event;
	ctx.assert(type === 1, 'not type1');
	let config = global.gameconfig.meventt1;
	config = config.deepQueryOne('ID', id);
	ctx.assert(config, 'invalid eid');
	ctx.config = config;
	ctx.event = event;
	await next();
}
