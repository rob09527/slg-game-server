
'use strict'

const moment = require('moment');



module.exports = exports = async (ctx, next) =>{
	let SERVER_START = moment(ctx.role._gameserv.groupstart).valueOf();
	ctx.mygroup = await ctx.dao.kinggroup.findOne({servid: ctx.role.servid});
	// 新服务器进入,创建新组
	if (!ctx.mygroup) ctx.mygroup = await ctx.dao.kinggroup.create({servid: ctx.role.servid});

	// 查找同组的所有服务器
	let list = await ctx.dao.kinggroup.find({groupmark: ctx.mygroup.groupmark});
	const servers = await ctx.dao.gameserver.find({});
	const sMap = {};
	servers.forEach(s => {
		sMap[s.servid] = s;
	})

	list = list.map(({servid, level}) =>{
		let config = sMap[servid];

		if (!config) return;
		let {
			name,
			area,
			sno
		} = config;
		return {
			servid,
			level,
			name,
			area,
			sno
		};
	}).filter(info => !!info);
	ctx.body = {list};
	ctx.body = {
		list,
		opentime: SERVER_START,
	};
}
