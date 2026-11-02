
'use strict'

module.exports = exports = async (ctx) =>{
	ctx.body = global.gameconfig.battlenorth[ctx.config.ID]
	ctx.assert(ctx.body, 'invalid bossidf');
}
