
'use strict'

const SELECT_SET = {
	'wei': {
		'campscore.wei': 1,
	},
	'shu': {
		'campscore.shu': 1,
	},
	'wu': {
		'campscore.wu': 1,
	},
	'qun': {
		'campscore.qun': 1,
	},
	'shen': {
		'campscore.shen': 1,
	},
	'mo': {
		'campscore.mo': 1,
	},
	'power': {
		'campscore.power': 1,
	},
	main: {
		_maxmapid: 1,
	},
	tower: {
		tower: 1,
	},
}

const OUTPUT_FIELD = {
	'wei': {
		'campscore.wei.num': 'score',
	},
	'shu': {
		'campscore.shu.num': 'score',
	},
	'wu': {
		'campscore.wu.num': 'score',
	},
	'qun': {
		'campscore.qun.num': 'score',
	},
	'shen': {
		'campscore.shen.num': 'score',
	},
	'mo': {
		'campscore.mo.num': 'score',
	},
	'power': {
		'campscore.power.num': 'score',
	},
	main: {
		_maxmapid: 'maxmapid',
	},
	tower: {
		tower: 'tower',
	},
}

module.exports = exports = async ctx =>{

	let {
		rank = [],
	} = ctx.request.body;
	ctx.body = [];
	for (let type of rank) {
		let rankService = new global.services.RankService(type, ctx.role._gameserv.groupid);
		let role = await rankService.rank(1, 1);
		role = role[0] || {};
		role.type = type;
		ctx.body.push(role);
	}
	let select = {
		rno: 1,
		rname: 1,
		hide: 1,
		iconid: 1,
		_power: 1,
		headid:1,
		frameid:1,
	}
	for (let type of rank) {
		let sp_select = SELECT_SET[type];
		if (!sp_select) continue;
		select = {
			...select,
			...sp_select,
		}
	}
	let roles = await ctx.dao.role.find({_id: {$in: ctx.body.map(a => a.id)}});
	let tmp = {};
	for (let role of roles) {
		tmp[role.i()] = role;
	}
	roles = tmp;
	ctx.body = ctx.body.map((r, index) =>{
		const {id: rid, score, type} = r;
		let role = roles[rid];
		let field = OUTPUT_FIELD[type];
		if (!rid || !role || !field) return;
        field = Object.values(field)[0]
		return {
			rid: role.i(),
			rname: role.name,
			level: role.level,
			iconid: role.iconid,
			frameid: role.frameid,
			headid: role.headid,
			[field]: score,
			power: role._power,
		}
	})
}
