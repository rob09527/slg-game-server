
'use strict'

module.exports = exports = async function (ctx, next) {
	const applys = await ctx.dao.apply.find({type: 'teampvp', to: ctx.team._id});
	let tmp = [];
	for (const apply of applys) {
		const role = await ctx.dao.role.findOne({_id: apply.rid});
		if (!role) continue;
		let general = await ctx.dao.general.find({rid: role._id}).hint({rid:1}).sort({class: -1, level: -1}).limit(1);
		general = general[0];
		let info = {
			id: apply._id.toString(),
			rid: role.i(),
			rname: role.name,
			power: role._power,
			level: role.level,
			iconid: role.iconid,
			frameid: role.frameid,
		}
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