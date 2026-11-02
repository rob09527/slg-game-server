
'use strict'

module.exports = exports = async function (ctx, next) {
	let {hour} = ctx.request.body;
	hour = parseFloat(hour);
	ctx.role.lastreap -= hour * 60 * 60 * 1000;
	await ctx.role.save();
	ctx.body = {hour: ((Date.now() - ctx.role.lastreap) / (60 * 60 * 1000)).toFixed(2)};
}