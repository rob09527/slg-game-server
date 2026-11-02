
'use strict'

module.exports = exports = async (ctx) =>{
	ctx.role.castItemsNoSave({gsid: 30024, count: 1});

	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	ctx.body = {result: battle.result};

	ctx.boss.lastdamge = battle.result.rlosthp;
	ctx.boss.totaldamge += ctx.boss.lastdamge;
}