
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		update,
		battleid,
	} = ctx.request.body;
	ctx.assert(ctx.boss.update === Number.parseInt(update), 'already update');
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	let {
		result: ret,
	} = battle;
	const {
		rlosthp: damage
	} = ret;
	ctx.boss.totaldamage += damage;
	ctx.myinfo.lastdamage = damage;
	ctx.myinfo.totaldamage += damage;
	ctx.body = {
		result: ret,
		damge: damage,
	}
}