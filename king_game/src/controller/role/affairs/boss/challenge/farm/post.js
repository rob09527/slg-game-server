
'use strict'

module.exports = exports = async (ctx, next) =>{
	const self = ctx.boss.roles.deepQueryOne('rid', ctx.role.i());
	ctx.assert(self, 'challenge first');
	ctx.assert(ctx.boss.killed === 0, 'boss is killed');
	ctx.assert(ctx.boss.expireAt >= Date.now(), 'boss is expired');
	self.damges += self.lastdamges;
	ctx.boss.totaldamges += self.lastdamges;
	ctx.boss.last = Date.now();

	ctx.body = {
		maxbphys: global.gameconfig.others.FRIEND.MAXBPHYS,
		boss: ctx.bossdata(),
	};
	ctx.body.boss.lastdamges = self.lastdamges;
	ctx.boss.markModified('roles.'+ctx.boss.roles.indexOf(self));
}
