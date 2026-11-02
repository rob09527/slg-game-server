
'use strict'

module.exports = exports = async function (ctx, next) {
	let bc = global.gameconfig.battlens2020[ctx.mid];
	ctx.assert(bc, 'invalid bossid');
	ctx.body = bc;
}