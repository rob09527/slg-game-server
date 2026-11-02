
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(!ctx.team.ready, 'team ready');
	const self = ctx.team.fellows.deepQueryOne('rid', ctx.role.i());
	ctx.assert(self && !self.leader, 'permission deny');
	ctx.team.fellows.remove(self);
	ctx.team.markModified('fellows');
	await ctx.team.updatePower();
	ctx.role.teamid = undefined;
	await ctx.role.save();
	ctx.body = {};
}