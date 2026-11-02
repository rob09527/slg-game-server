
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.assert(ctx.affairs, 'invalid affairs');
	const gsid = parseInt(ctx.request.body.scroll);
	ctx.assert(gsid, 'invalid scroll');
	const star = global.gameconfig.others.AFFAIRS.REEL_STAR.indexOf(gsid) + 1;
	ctx.role.castItemsNoSave({gsid: gsid, count: 1});
	const missions = global.gameconfig.affairs.deepQuery('STAR', star);
	ctx.assert(missions.length > 0, 'invalid missions');
	ctx.body = ctx.rand_m(1, missions)[0];
	ctx.affairs.missions.push(ctx.body);
	ctx.affairs.markModified('missions');
	await ctx.role.save();
	await ctx.affairs.save();
}
