
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.body = {
		name: ctx.legion.name,
	};
}