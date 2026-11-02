
'use strict'

module.exports = exports = async (ctx, next) => {
	ctx.hook.pre(EVENT_ENUM.PVP_KING);
	let battleset_exist = [];
	for (let i = 1; i <= 2; i++) {
		battleset_exist.push(ctx.role.battlearr[`kingpvp${i}`]);
	}
	battleset_exist = battleset_exist.find(battleset => !!battleset);
	ctx.assert(battleset_exist, 'battleset nexist');
	ctx.score_card = await ctx.dao.pvpking.findOne({rid: ctx.role.i()});
	ctx.mygroup = await ctx.dao.kinggroup.findOne({servid: ctx.role.servid});
	// 新服务器进入,创建新组
	if (!ctx.mygroup) ctx.mygroup = await ctx.dao.kinggroup.create({servid: ctx.role.servid});
	await next();
}
