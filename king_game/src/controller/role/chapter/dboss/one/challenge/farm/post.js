
'use strict'

module.exports = exports = async (ctx) =>{
	let {times} = ctx.request.body;
	times = parseInt(times) || 1;
	for (let i = 0; i < times; i++) {
		if (ctx.boss.totaldamge >= ctx.config.HP) {
			times = i;
			break;
		}
		ctx.boss.totaldamge += ctx.boss.lastdamge;
	}
	ctx.times = times;
	ctx.role.castItemsNoSave({gsid: 30024, count: times});
	ctx.body = {};
	let info = ctx.boss.base();
	if (info.nowhp > 0) ctx.body.info = info;
}