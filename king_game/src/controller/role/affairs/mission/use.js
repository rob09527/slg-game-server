
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.assert(ctx.affairs, 'invalid affairs');
	const type = ctx.request.body.type || 'solo';
	const _key = {
		friend: 'friendsMissions',
		solo: 'missions'
	};
	ctx.missionKey = _key[type];
	ctx.assert(ctx.missionKey, 'invalid mission type');
	ctx.missionid = ctx.request.body.mid;
	ctx.mission = ctx.affairs[ctx.missionKey].deepQueryOne('mid',ctx.missionid);
	ctx.assert(ctx.mission, 'invalid mission');

	await next();
	ctx.affairs.markModified(ctx.missionKey);
	await ctx.affairs.save();
	if (!ctx.body) ctx.body = {};
}
