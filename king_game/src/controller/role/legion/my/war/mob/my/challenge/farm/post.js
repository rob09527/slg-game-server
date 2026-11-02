
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		times = 1,
	} = ctx.request.body;
	ctx.assert(ctx.mob.lastdamage > 0, 'challenge first');
	ctx.times = Number.parseInt(times);
	ctx.role.castItemsNoSave({gsid: 30024, count: ctx.times});
	ctx.mob.totaldamage += ctx.mob.lastdamage * ctx.times;
}
