
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.role.castItemsNoSave({gsid: 30024, count: 1});
	let {
		battleid,
	} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	let {
		result: ret,
	} = battle;
	const {
		rlosthp: damage
	} = ret;
	ctx.mob.lastdamage = damage;
	ctx.mob.totaldamage += damage;
	await ctx.mob.save();
	ctx.body = {
		result: ret,
		damge: damage,
	}
}
