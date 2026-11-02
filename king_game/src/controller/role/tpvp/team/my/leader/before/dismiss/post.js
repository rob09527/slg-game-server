
'use strict'

module.exports = exports = async function (ctx, next) {
	const {rid} = ctx.request.body;
	ctx.assert(rid !== ctx.role.i(), 'self forbid');
	const info = ctx.team.fellows.deepQueryOne('rid', rid);
	ctx.assert(info, 'member nexist');
	ctx.team.fellows.remove(info);
	ctx.team.markModified('fellows');
	const role = await ctx.dao.role.findOne({_id: rid});
	if (role) {
		role.teamid = null;
		await role.save();
	}
	await ctx.team.updatePower();
	ctx.body = await ctx.team.base();
}