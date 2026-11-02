
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.SHOP , 'gxlb not open');

	// ctx.body = {end: ctx.ENDTIME, items: items};
	ctx.body = ctx.SHOP;
}