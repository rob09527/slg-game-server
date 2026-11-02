
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = ctx.role.avatarInfo();
	// 所有的阵容战力总和
	ctx.body.bsetpower = 0;
	for (let i = 1; i <= 3; i++) {
		ctx.body.bsetpower += ctx.role._powerbattleset[`kingpvp${i}`] || 0;
	}
	ctx.body.hstage = ctx.role.hstage;
	// 可选,角色军团名字
	if (!ctx.role.legion) return;
	let legion = await ctx.dao.legion.findOne({_id: ctx.role.legion});
	if (!legion) return;
	ctx.body.legion = legion.name;
}