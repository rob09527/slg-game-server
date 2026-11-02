
'use strict'

module.exports = exports = async (ctx) =>{
	ctx.body = await ctx.dao.dboss.find({rid: ctx.role._id});
	ctx.body = ctx.body.map(boss =>{
		return boss.base();
	}).filter(function (boss) {
		return Date.now() < boss.etime && boss.nowhp > 0;
	})
}