
'use strict'

module.exports = exports = async function (ctx, next) {
	let tmp = [];
	// 加入跨服组判断
	let mygroup1 = await global.dao.kinggroup.findOne({servid: ctx.role.servid});
	for (const rid of ctx.role.friends) {
		const role = await ctx.dao.role.findOne({_id: rid});
		if (role.teamid) continue;
		let mygroup2 = await global.dao.kinggroup.findOne({servid: role.servid});
		if(mygroup1.groupmark != mygroup2.groupmark) continue;
		let info = {
			rid: role.i(),
			rname: role.name,
			power: role._power,
			level: role.level,
			iconid: role.iconid,
			frameid: role.frameid,
		}
		let general = await ctx.dao.general.find({rid}).hint({rid:1}).sort({class: -1, level: -1}).limit(1);
		general = general[0];
		if (general) {
			const config = global.gameconfig.general[general.gsid];
			if (config) {
				let g = {
					guid: general._id.toString(),
					gsid: general.gsid,
					class: general.class,
					level: general.level,
					star: config.STAR,
					camp: config.CAMP,
					occu: config.OCCU,
					skin:general.skin?general.skin:null
				}
				info.bestgeneral = g;
			}
		}
		tmp.push(info);
	}
	ctx.body = tmp;
}