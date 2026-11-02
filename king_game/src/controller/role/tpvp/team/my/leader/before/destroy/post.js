
'use strict'

module.exports = exports = async function (ctx, next) {
	for (const fellow of ctx.team.fellows) {
		const role = await ctx.dao.role.findOne({_id: fellow.rid});
		if (!role) continue;
		role.teamid = null;
		await role.save();
	}
	await ctx.team.remove();
	ctx.body = {};
}