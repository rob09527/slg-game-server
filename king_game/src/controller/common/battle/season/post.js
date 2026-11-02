
'use strict'

module.exports = exports = async (ctx, next) =>{
	const {VALS: vals} = global.gameconfig.others.BATTLESEASON;
	ctx.body = {
		vals,
		info: ctx.bseason()
	};
}