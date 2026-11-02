
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.role.castItemsNoSave({gsid: 30024, count: 1});

	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();

	let {result} = battle;
	ctx.body.result = result;
	ctx.body.damge = result.rlosthp;

	ctx.boss.lastdamge = result.rlosthp;
	ctx.boss.totaldamge += result.rlosthp;
}