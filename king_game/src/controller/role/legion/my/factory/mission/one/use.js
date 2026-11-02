
'use strict'

module.exports = exports = async (ctx, next) =>{
	const {key} = ctx.request.body;
	ctx.mission = ctx.role.lmission.data.deepQueryOne('key', key);
	ctx.assert(ctx.mission, 'mission nexist');
	ctx.config = global.gameconfig.legionmission.deepQueryOne('ID', ctx.mission.id);
	ctx.assert(ctx.config, 'invalid missionid');
	await next();
	await ctx.role.save();
}