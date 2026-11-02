
'use strict'

module.exports = exports = async (ctx, next) =>{

	let {battleid} = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({_id: battleid});
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	let {result} = battle;

	let self = ctx.boss.roles.deepQueryOne('rid', ctx.role.i());
	if (!self) {
		self = {rid: ctx.role.i(), damges: 0};
		ctx.boss.roles.push(self);
	}

	self.lastdamges = result.rlosthp;
	self.damges += self.lastdamges;
	self.last = Date.now();
	
	ctx.boss.markModified('roles.'+ctx.boss.roles.indexOf(self));
	ctx.boss.totaldamges += result.rlosthp;
	ctx.boss.last = Date.now();
	ctx.body = {
		result,
		last: ctx.boss.last,
		damge: self.lastdamges
	};
}