
'use strict'

const path = require('path');

module.exports = exports = async (ctx) =>{
	const config = global.gameconfig.battletower;
	ctx.assert(config, 'config nexist');
	ctx.body = config[ctx.role.tower + 1];
	ctx.assert(ctx.body, 'not open');
}