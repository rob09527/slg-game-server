
'use strict'

module.exports = exports = async (ctx) =>{
	ctx.body = global.gameconfig.battledboss[ctx.config.ID]
	ctx.assert(ctx.body, 'invalid bossidf');
}