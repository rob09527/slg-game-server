
'use strict'

module.exports = exports = async (ctx) =>{

	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	console.log('battle.result', battle.result);
	ctx.body = {result: battle.result};
	ctx.boss.lastdamge = ctx.boss.lastdamge || {};
	ctx.all_damge = battle.result.rlosthp;
	ctx.boss.lastdamge[ctx.role.i() ] = ctx.boss.lastdamge[ctx.role.i() ] || {};
	ctx.boss.lastdamge[ctx.role.i()] [ctx.team.type] = ctx.all_damge;

	ctx.boss.totaldamge += ctx.all_damge;
}
