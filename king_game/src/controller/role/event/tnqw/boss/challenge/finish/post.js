
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		battleid
	} = ctx.request.body;
	ctx.role.castItemsNoSave({gsid: 30024, count: 1});
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	let {
		result: {
			rlosthp,
		}
	} = battle;
	ctx.boss.last = Date.now();
	ctx.boss.lastdamge = rlosthp;
	ctx.boss.totaldamge += rlosthp;
	ctx.body = {
		last: ctx.boss.last,
		result: battle.result,
		damge: ctx.boss.lastdamge,
	};
}