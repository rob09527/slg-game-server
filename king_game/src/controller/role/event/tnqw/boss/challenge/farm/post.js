
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {times} = ctx.request.body;
	times = parseInt(times) || 1;
	
	let base = ctx.boss.base();
	let {
		nowhp,
		maxhp,
	} = base;
	let i = 0;
	for (; i < times; i++) {
		if (ctx.boss.totaldamge >= maxhp) break;
		ctx.boss.totaldamge += ctx.boss.lastdamge;
	}
	ctx.times = i;
	ctx.role.castItemsNoSave({gsid: 30024, count: i});
	base = ctx.boss.base();
	({nowhp, maxhp} = base);
	ctx.body = {
		nowhp,
	};
}