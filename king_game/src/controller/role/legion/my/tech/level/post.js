
'use strict'
const { hitHere } = require("../../../../../../util/weektarget");

module.exports = exports = async (ctx, next) =>{
	const {id} = ctx.request.body;
	const config = global.gameconfig.legiontech[id];
	ctx.assert(config, 'invalid techid');
	let techlv = ctx.role.tech[id] || 0;
	if (config.PRE && config.PRE[techlv]) {
		const PRE = config.PRE[techlv];
		console.log(id, techlv, PRE)
		const prelv = ctx.role.tech[PRE.ID] || 0;
		ctx.assert(prelv >= PRE.LV, 'pre nfinish');
	}
	let costitems = [];
	for (const gsid in config.COST) {
		const count = config.COST[gsid][techlv];
		ctx.assert(count, 'no more');
		costitems.push({gsid: parseInt(gsid), count: count});
	}
	ctx.role.castItemsNoSave(costitems, {main: 'tech', sec: 'lv'});
	techlv++;
	ctx.role.tech[id] = techlv;
	ctx.role.markModified('tech.'+id);
	// 新七日目标，军团科技等级
    let curNum = ctx.role.getProp(98600);
	if (techlv - curNum > 0) {
		hitHere(ctx.role, 98600, techlv);
	}
	else {
		hitHere(ctx.role, 98600, 1, true);
	}
	await ctx.role.save();
	ctx.body = {costitems};
}