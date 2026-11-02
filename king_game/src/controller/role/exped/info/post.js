
'use strict'

module.exports = exports = async (ctx, next) =>{
	if (!ctx.cache) {
		ctx.cache = new ctx.dao.exped({rid: ctx.role._id});
		ctx.cache.map = [];
		let select_role = {
			rno: 1, rname: 1, iconid: 1, exp: 1,headid:1,frameid:1,
			'_powerbattleset.pvpdef': 1,
			'battlearr.pvpdef': 1,
			'hide': 1,
			tech: 1,
			mythical: 1,
		}
		let histpower = ctx.role.getItems(90185).count
		while(ctx.cache.map.length < 30){
			const index = ctx.cache.map.length;
			const config = global.gameconfig.expedmap[index];
			let role = [];
			const power_$gte = Math.floor(histpower * config.POWER[0] / 1000);
			const power_$lte = Math.floor(histpower * config.POWER[1] / 1000);
			// filter
			if (role.length < 1) {	// player in range
				let cond = {
					_id: {$ne: ctx.role._id},
					'battlearr.pvpdef': {$exists: true},
					'_powerbattleset.pvpdef': {$gte: power_$gte, $lte: power_$lte}
				}
				role = await ctx.dao.role.find(cond, select_role);
			}
			if (role.length < 1) {	// robot in range
				role = global.gameconfig.robotpvp.filter(function (r) {
					return r.POWER >= power_$gte && r.POWER <= power_$lte;
				})
			}
			if (role.length < 1) {	// player out of  range
				let cond = {
					_id: {$ne: ctx.role._id}, 'battlearr.pvpdef': {$exists: true},
					$or: [
						{'_powerbattleset.pvpdef': {$gt: power_$lte}},
						{'_powerbattleset.pvpdef': {$lt: power_$gte}},
					]
				}
				role = await ctx.dao.role.find(cond);
			}
			if (role.length < 1) {	// robot out of range
				role = global.gameconfig.robotpvp.filter(function (r) {
					return r.POWER < power_$gte || r.POWER > power_$lte;
				})
			}
			ctx.assert(role.length > 0, 'no targets');
			role = role[ctx.random.between(0, role.length - 1)];
			// convert
			if (role._id) {	// player
				let info = {
					rname: role.name, level: role.level, iconid: role.iconid,
					headid:role.headid,frameid: role.frameid,
					power: role._powerbattleset.pvpdef
				};
				info.battleset = await role.getBattleSet('pvpdef');
				ctx.cache.map.push(info)
			}else{	// robot
				ctx.cache.map.push(ctx.dao.role.robotGenerator(role));
			}
		}
		await ctx.cache.save();
	}
	const index = ctx.role.getItems(90153).count;
	ctx.body = {
		mapkey: ctx.cache.refresh,
		map: ctx.cache.map[index],
		info: {hp: ctx.cache.hp, wish: ctx.cache.wish}
	}
}