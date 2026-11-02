
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		simulator,
	} = ctx.request.body;
	simulator = Number.parseInt(simulator);
	ctx.simulator = false;
	// 0,非模拟器;1,模拟器;2,不能判断
	if (typeof simulator === 'number' && simulator == 1) ctx.simulator = true;
	ctx.sdk = {};
	await next();
}