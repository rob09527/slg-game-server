
'use strict'
/**
 * 
 * 时间:7小时过期
 * 
 */
const _ = require('lodash');

const {
	EDIT_CAST,
} = global.gameconfig.kingdom;

module.exports = exports = async function (ctx, next) {
	let {
		kingrid,
		name,
		icon,
		endtime,
		standings,
		shames,
		gifts,
	} = ctx.kingdom;
	// wangpvp_stands 缓存 5分钟
	let tmp_standings = await global.services.WangpvpService.find("wangpvp:standings:" + kingrid);
	if (tmp_standings) console.log('wangpvp:standings用了缓存', new Date().toLocaleString())
	if (!tmp_standings || Object.keys(tmp_standings).length == 0) {
		tmp_standings = [];
		for (let rid of standings) {
			let select = {
				rno: 1, rname: 1, frameid: 1, headid: 1,
				hide: 1, 'set': 1, legion: 1, servid: 1
			}
			let role = await ctx.dao.role.findOne({ _id: rid }, select);
			ctx.assert(role, 'role nexist');
			let roleinfo = {
				rid: role.i(),
				rno: role.rno,
				rname: role.name,
				frameid: role.frameid,
				headid: role.headid,
				level: role.level,
				vip: role.vip,
				'set': role.set,
				servid: role.servid
			}
			if (role.legion) {
				let legion = await ctx.dao.legion.findOne({ _id: role.legion }, { name: 1 });
				roleinfo.lname = legion.name;
			}
			tmp_standings.push(roleinfo)
		}
		await global.services.WangpvpService.set("wangpvp:standings:" + kingrid, tmp_standings, 15 * 60);
	}


	ctx.body = {
		name,
		icon,
		standings: tmp_standings,
		endtime,
	}
	let youjie = shames.filter(({ endtime }) => {
		return endtime > Date.now();
	})
	youjie = youjie[0];
	if (youjie) {
		let thisMan = await global.services.WangpvpService.find("wangpvp:youjie:" + youjie.rid);
		if (thisMan) console.log('wangpvp:youjie用了缓存', new Date().toLocaleString())
		if (!thisMan || Object.keys(thisMan).length == 0) {
			thisMan = await ctx.dao.role.findOne({ _id: youjie.rid }, { servid: 1 });
			await global.services.WangpvpService.set("wangpvp:youjie:" + youjie.rid, thisMan, 5 * 60);
		}
		if (thisMan) youjie.servid = thisMan.servid;
		ctx.body.youjie = youjie;
	}
	if (ctx.role.i() === kingrid) {
		// 修改消耗
		ctx.body.editcast = {};
		for (let [key, count = 0] of Object.entries(ctx.kingdom.editcount)) {
			if (key.startsWith('$')) continue;
			ctx.body.editcast[key] = EDIT_CAST[count];
			// 如果次数超出枚举则取最后一个元素
			if (!ctx.body.editcast[key]) ctx.body.editcast[key] = _.last(EDIT_CAST);
			// 图腾不消耗
			if (key === 'icon') ctx.body.editcast[key] = [];
		}
	} else {
		// 有效赏赐列表(未过期&未领取)
		ctx.body.gifts = gifts.filter(({ endtime }) => {
			return Date.now() < endtime;
		}).filter(({ roles }) => {
			return !roles.includes(ctx.role.i());
		})
	}
}