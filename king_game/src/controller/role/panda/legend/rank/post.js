'use strict'

const SELECT = {
	rno: 1, rname: 1,
	'hide.38001': 1, 'hide.38003': 1,
	iconid: 1, headid: 1,
	frameid: 1
}

module.exports = exports = async function (ctx, next) {
	let type = (ctx.request.body.type ?  "legend-all-" : "legend-one-") + ctx.CACHE.season;
	let max = ctx.CONFIG.SETTING.RANK || 20;
	let rankService = new global.services.RankService(type, ctx.role.servid); //应该改成ctx.role._gameserv.groupid
	let list = await rankService.rank(1, max);
	let roles = list.map(({ id }) => id);
	roles = await ctx.dao.role.find({ _id: { $in: roles } }, SELECT);
	const tmp = {};
	roles.forEach(one => {
		tmp[one._id.toString()] = one;
	})
	list = list.map(({ id, score }) => {
		let role = tmp[id];
		if (!role) return;
		return {
			rid: role.i(),
			rname: role.name,
			iconid: role.iconid,
			frameid: role.frameid,
			headid: role.headid,
			level: role.level,
			vip: role.vip,
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
	