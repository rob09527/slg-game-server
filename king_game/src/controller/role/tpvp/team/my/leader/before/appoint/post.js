
'use strict'

module.exports = exports = async function (ctx, next) {
	const {rid} = ctx.request.body;
	const fellow = ctx.team.fellows.deepQueryOne('rid', rid);
	ctx.assert(fellow, 'member nexist');
	const self = ctx.team.fellows.deepQueryOne('rid', ctx.role.i());
	fellow.leader = 1;
	self.leader = 0;
	ctx.team.markModified('fellows');
	await ctx.team.save();
	ctx.body = await ctx.team.base();
}