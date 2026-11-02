'use strict'

const _ = require('lodash');

const SELECT_SET = {
	XSGX: {
		rno: 1, rname: 1, 'hide.38001': 1,
		iconid: 1, _power: 1, headid: 1,
		frameid: 1,
		pvpscore: 1,
	},
	
}

// 限时观星-观星榜单
module.exports = exports = async function (ctx, next) {
	let file = "panda_gxjl" + ctx.FILEID;
	let config = global.gameconfig[file];
	let max = config[config.length-1].MAX;
	let rankService = new global.services.RankService("panda-gxbd", ctx.role._gameserv.groupid);
	let list = await rankService.rank(1, max);
	let roles = list.map(({ id }) => id);
	let select = SELECT_SET[ctx.KEY];
	roles = await ctx.dao.role.find({ _id: { $in: roles } }, select);
	const tmp = {};
	roles.forEach(one => {
		tmp[one._id.toString()] = one;
	})
	list = list.map(({ id, score }) => {
		let role = tmp[id];
		if (!role) return;
		let bsetpower = undefined;
		let servid = role.servid; 
		return {
			rid: role.i(),
			rname: role.name,
			iconid: role.iconid,
			frameid: role.frameid,
			headid: role.headid,
			power: role._power,
			bsetpower: bsetpower,
			level: role.level,
			servid,
			score,
		}
	}).filter(Boolean);

	let selfrank = await rankService.getItemRank(ctx.role.i());
	let selfscore = await rankService.getItemScore(ctx.role.i());
	ctx.body = {
		list,
	}
	if (selfrank) ctx.body.selfrank = selfrank;
	if (selfscore) ctx.body.selfscore = selfscore;
}
	