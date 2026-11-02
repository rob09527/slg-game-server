
'use strict'

module.exports = exports = async (ctx, next) =>{
	const pos = ctx.legion._members.deepQueryOne('rid', ctx.role.i()).pos;
	ctx.assert(pos > 0, 'permission deny');
	await next();
}