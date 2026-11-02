
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.body = {
		maxbphys: global.gameconfig.others.FRIEND.MAXBPHYS,
		boss: ctx.bossdata()
	};
	const self = ctx.boss.roles.deepQueryOne('rid', ctx.role.i());
	if (self) ctx.body.boss.lastdamges = self.lastdamges;
}