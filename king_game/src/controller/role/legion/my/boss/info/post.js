
'use strict'

module.exports = exports = async (ctx, next) => {
	let fconfig = global.gameconfig.battlelboss[ctx.boss.index + 1];
	// playerchapter,玩家通关则返回,没通关返回空
	let tmp = {
		boss: {
			playerchapter: ctx.playerchapter,
			chapter: ctx.boss.index + 1,
			name: ctx.config.NAME,
			rewards: ctx.config.ITEMS,
			bset: fconfig,
			maxhp: ctx.config.BOSSHP,
			nowhp: Math.max(ctx.config.BOSSHP - (ctx.boss.killed.time ? ctx.config.BOSSHP : ctx.boss.totaldamges), 0),
		}
	}
	let roles = ctx.boss.roles
	let rank = [];
	for (let { rid, damges } of roles) {
		let _tmp = { damge: damges };
		let role = await ctx.dao.role.findOne({ _id: rid });
		if (role) {
			_tmp.id = rid;
			_tmp.name = role.name;
			_tmp.power = role._power;
			_tmp.icon = role.iconid;
			_tmp.level = role.level;
			_tmp.headid = role.headid;
			_tmp.frameid = role.frameid;
		} else {
			_tmp.name = 'unknow';
		}
		rank.push(_tmp);
	}
	tmp.rank = rank;
	let self = rank.deepQueryOne('id', ctx.role.i());
	if (self) {
		tmp.self = { rank: rank.indexOf(self) + 1 }
		let my = roles.deepQueryOne('rid', ctx.role.i());
		if (my) tmp.self.lastdamge = my.lastdamge;
	}
	ctx.body = tmp;
}