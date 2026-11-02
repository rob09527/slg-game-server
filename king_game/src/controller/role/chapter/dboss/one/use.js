
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {id} = ctx.request.body;
	ctx.config = global.gameconfig.dboss.deepQueryOne('ID', parseInt(id));
	ctx.assert(ctx.config, 'invalid bossid');
	ctx.boss = await ctx.dao.dboss.findOne({rid: ctx.role._id, id: ctx.config.ID});
	ctx.assert(ctx.boss && !ctx.boss.kill, 'boss nexists');
	await next();
}