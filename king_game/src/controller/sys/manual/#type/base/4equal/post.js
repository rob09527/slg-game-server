
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = ctx.role.avatarInfo();
	let cache = await ctx.dao.equalinfo.findOne({rid: ctx.role._id});
	if (cache) {
		ctx.body.general = cache.generalsBase();
		if (cache.team) ctx.body.battleset = cache.getBattleSet();
	}
}