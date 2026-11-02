
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.body = global.gameconfig.time.pvp;
}