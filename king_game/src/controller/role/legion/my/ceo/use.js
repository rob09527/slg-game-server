
'use strict'

module.exports = exports = async (ctx, next) =>{
	const relate = ctx.legion._members.deepQueryOne('rid', ctx.role.i());
	ctx.assert(relate && relate.pos >= 2, 'only ceo');
	await next();
}