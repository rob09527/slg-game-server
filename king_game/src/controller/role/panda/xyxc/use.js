
'use strict'

module.exports = exports = async function (ctx, next) {
	let [ok, season, id] = ctx.role.isInPanda("xyxc");
	ctx.assert(ok , 'xyxc not open');
	let d = ctx.role.panda.xyxc;
	if (!d || d.season != season){
		ctx.role.panda.xyxc = {
			score: 0,
			season: season
		};
		ctx.role.markModified('panda');
		await ctx.role.save();
	}
	ctx.KEY = "XSGX";
	ctx.FILEID = id;
	ctx.CACHE = ctx.role.panda.xyxc;

	await next();
}