
'use strict'

module.exports = exports = async (ctx) =>{
	let {eventid} = ctx.request.body;
	const event = ctx.CACHE.event[eventid];
	ctx.assert(event, 'invalid event');
	const file = 'panda_gjxb_fight'+ctx.FILEID;
	const cfg = global.gameconfig[file];
	ctx.assert(cfg, 'invalid fight config');
	const config = cfg[event.id];
	ctx.assert(config, 'invalid fight config');

	let player = await ctx.role.getBattleSet('normal');

	const type = 'gjxb'+ctx.FILEID;
	const battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: type,
		player: player,
		mapid: eventid
	});

	await battle.createEnemy(event.id).save();

	ctx.body = battle.base();
}
