
'use strict'

module.exports = exports = async function (ctx, next) {
	const self = ctx.team.fellows.deepQueryOne('rid', ctx.role.i());
	ctx.assert(self && self.leader, 'permission deny');
	await next();
}