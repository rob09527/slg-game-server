
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.boss.lastdamge > 0, 'challenge first');
	ctx.body.damge = 0;
	let {times = 1} = ctx.request.body;
	times = Math.max(times, 1);
	let {HP} = ctx.config;
	let casttimes = 0;
	for (let i = 0; i < times; i++) {
		casttimes++;
		ctx.body.damge += ctx.boss.lastdamge;
		ctx.boss.totaldamge += ctx.boss.lastdamge;
		if (ctx.boss.totaldamge >= HP) break;
	}
	ctx.role.castItemsNoSave({gsid: 30024, count: casttimes});
}