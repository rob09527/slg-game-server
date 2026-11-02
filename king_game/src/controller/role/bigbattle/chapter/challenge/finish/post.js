
'use strict'

const acquireLock = require("../../../../../../util/acquireLock");

module.exports = exports = async (ctx) => {
	let { battleid, win } = ctx.request.body;
	// let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
	// ctx.assert(battle, 'invalid battleid');
	// await battle.cal();
	let result = await acquireLock(`${ctx.role.rno}-battlefinish`, 30000)
	ctx.assert(result, 'lock buy');
	ctx.body = { result: { ret: win } };
	if (ctx.body.result.ret !== 'win') return;
	let { GSID, COUNT } = ctx.config.PASS;
	const pass = ctx.role.getItems(GSID).count;
	if (pass < COUNT) ctx.role.addItemsNoSave(GSID);
	ctx.role.addItemsNoSave({ GSID: 90680, COUNT: 1 });//月度副本
}