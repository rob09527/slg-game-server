
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = ctx.role.avatarInfo();
	// 可选,角色军团名字
	if (!ctx.role.legion) return;
	let legion = await ctx.dao.legion.findOne({_id: ctx.role.legion});
	if (!legion) return;
	ctx.body.legion = legion.name;
}