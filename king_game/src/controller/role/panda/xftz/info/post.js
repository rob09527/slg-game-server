
'use strict'
// 新服挑战数据
module.exports = exports = async function (ctx, next) {
	let first = [];
	let infos = await ctx.dao.c_xftz.find({season: ctx.CACHE.season, servid: ctx.role.servid});
	for (let info of infos) {
		if(info.player.rid == ctx.role.rid && info.player.rname != ctx.role.name) {
			info.player.rname = ctx.role.name;
			await ctx.dao.c_xftz.updateOne({_id:info._id},{$set:{"player.rname":ctx.role.name}});
		}
		first.push({
			floor:info.floor,
			player:info.player,
			flag:ctx.CACHE.first[info.floor]
		})
	}
	ctx.body = {
		id: ctx.FILEID, // 活动配置ID
		info: ctx.CACHE.floor, // 自己通关信息
		first: first, // 首通信息
	}
}