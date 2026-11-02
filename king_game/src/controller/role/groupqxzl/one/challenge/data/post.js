
'use strict'

module.exports = exports = async (ctx) =>{
	const config = global.gameconfig['battle'+ctx.config.TYPE];
	ctx.assert(config, 'fconfig nexist');
	ctx.body = config[ctx.qxzl.pos];
	ctx.assert(ctx.body, 'not open');
}