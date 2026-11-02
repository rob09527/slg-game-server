
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		id,
	} = ctx.request.body;
	ctx.prisoner = await ctx.dao.prisoner.findOne({ _id: id });
	ctx.assert(ctx.prisoner, 'not exist');
	ctx.config = global.gameconfig.surrender.deepQueryOne('GSID', ctx.prisoner.gsid);
	ctx.assert(ctx.config, 'invalid prisoner')
	await next();
	await ctx.prisoner.save();
}