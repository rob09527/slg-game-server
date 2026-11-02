
'use strict'

const MULTI_TEAM = [
	'kingpvp',
	'multipvp',
	'ringpvp'
]

const BATTLESET_ROBOT_CONFIG = {
	'pvpdef': 'robotpvp',
	'kingpvp': 'robotkingpvp',
	'multipvp': 'robotmpvp',
	'teampvp': 'robotpvp'
}

module.exports = exports = async (ctx, next) => {
	let {
		rids = [],
		rnames = [],
		battleset,
		nobest,
		nolegion,
		pvpdef,
	} = ctx.request.body;
	if (pvpdef == 'pvp3vs3') {
		return await threevsthree(ctx)
	}
	// 兼容
	if (pvpdef && !battleset) battleset = 'pvpdef';
	rids = [...rids, ...rnames];
	ctx.body = [];
	for (let mix of rids) {
		let [
			rid,
		] = mix.split('|');	// 兼容过去请求结构,原结构[rid|rname]|sid
		let role;
		// 从配置表中获取机器人信息
		if (rid.startsWith('robot')) {
			let [
				,
				robotid,
			] = rid.split('_');
			let key = BATTLESET_ROBOT_CONFIG[(battleset || 'pvpdef')];
			let config = global.gameconfig[key].deepQueryOne('ID', parseInt(robotid));
			ctx.assert(config, 'invalid rrid');
			role = ctx.dao.role.robotGenerator(config);
			role.sex = role.sex || 1;
			if (battleset === 'pvpdef') role.points = 1000;	// 机器人默认1000
			role.rid = rid;
		} else {
			let key = 'rname';
			if (rid.length == 24) key = '_id';
			let _role = await ctx.dao.role.findOne({ [key]: rid });
			if (!_role) continue;
			let tmp = _role.avatarInfo();
			// 最强10武将(可选)
			if (!nobest) tmp.bestgeneral = await _role.getBestGeneralList();
			// 获取军团信息(可选)
			if (!nolegion && _role.legion) {
				let legion = await ctx.dao.legion.findOne({ _id: _role.legion }, { name: 1 });
				if (legion) {
					tmp.legion = {
						id: _role.legion,
						name: legion.name,
					}
				}
			}
			// 同组服
			let serv = await global.dao.gameserver.findOne({ servid: tmp.servid }, { info: 0, sno: 0 });
			if (serv) {
				tmp.isgroup = ctx.role._gameserv.groupid == serv.groupid;
			}
			if (!battleset) {
				ctx.body.push(tmp);
				continue;
			}
			if (MULTI_TEAM.includes(battleset)) { // 多队伍阵容获取
				tmp.battleset = [];
				for (let i = 1; ; i++) {
					let setname = `${battleset}${i}`;
					let setdata = await _role.getBattleSet(setname);
					if (Object.keys(setdata.team).length < 1) break;
					setdata.power = _role._powerbattleset[setname] || 0;
					tmp.battleset.push(setdata);
				}
			} else if (battleset === 'pvpequal') { // 公平演武阵容获取
				tmp.general = [];
				let cache = await ctx.dao.equalinfo.findOne({ rid: _role._id });
				if (cache) tmp.general = cache.generalBase();
			} else if (_role.battlearr[battleset]) {	// 一般阵容获取
				tmp.battleset = await _role.getBattleSet(battleset);
				tmp.power = _role._powerbattleset[battleset];
				// 演武阵容需要额外带演武积分
				if (battleset === 'pvpdef') tmp.points = _role.pvpscore;
			}
			role = tmp;
		}
		ctx.body.push(role);
	}
}

async function threevsthree(ctx) {
	let {
		rids = [],
		rnames = [],
		battleset,
		nobest,
		nolegion,
		pvpdef,
	} = ctx.request.body;
	ctx.body = [];
	for (let mix of rids) {
		let [
			rid,
		] = mix.split('|');	// 兼容过去请求结构,原结构[rid|rname]|sid
		let role;
		// 从配置表中获取机器人信息
		if (rid.startsWith('robot')) {
			let [
				,
				robotid,
			] = rid.split('_');
			let list = []
			for (let x = 0; x < 3; x++) {
				const config = global.gameconfig.pvpmultiplayer.robot[robotid][x];
				ctx.assert(config, 'invalid rrid');
				role = ctx.dao.role.robotGenerator(config);
				list.push(role.battleset)
			}
			role.battlesetlist = list
			role.sex = role.sex || 1;
			role.rid = rid;
			ctx.body.push(role);
		} else {
			let key = 'rname';
			if (rid.length == 24) key = '_id';
			let _role = await ctx.dao.role.findOne({ [key]: rid });
			if (!_role) continue;
			let tmp = _role.avatarInfo();
			// 最强10武将(可选)
			if (!nobest) tmp.bestgeneral = await _role.getBestGeneralList();
			// 获取军团信息(可选)
			if (!nolegion && _role.legion) {
				let legion = await ctx.dao.legion.findOne({ _id: _role.legion }, { name: 1 });
				if (legion) {
					tmp.legion = {
						id: _role.legion,
						name: legion.name,
					}
				}
			}
			// 同组服
			let batllearr = [];
			for (let i = 1; i <= 3; i++) {
				let bset = await _role.getBattleSet(`defense${i}`);
				batllearr.push(bset);
			};
			tmp.battlesetlist = batllearr
			ctx.body.push(tmp);
		}
	}
	return ctx.body
}