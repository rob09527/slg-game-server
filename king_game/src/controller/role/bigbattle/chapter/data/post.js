
'use strict'

const path = require('path');

module.exports = exports = async (ctx) =>{
	const config = global.gameconfig.battlebigbattle;
	ctx.assert(config, 'fconfig nexist');
	ctx.body = config[ctx.request.body.bigid];
	ctx.assert(ctx.body, 'not open');
}