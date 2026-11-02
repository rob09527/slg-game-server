
'use strict'

const _ = require('lodash');

const {
	LEGION: {
		WARBOSS: {
			CHALLENGE_CAST,
		},
	},
} = global.gameconfig.others;

module.exports = exports = async function (ctx, next) {
	let config = global.gameconfig.legionwarmobboss.deepQueryOne('SEASON', ctx.bseason().season);
	ctx.assert(config, 'invalid season');
	let {
		BATTLESET,
		STAGE
	} = config;
	let buffs = STAGE.map(({ATTR}) => ATTR);
	let rank = [];
	for (let {rid, totaldamage: damage} of ctx.boss.roles) {
		let select = {
			rno: 1,
			rname: 1,
			frameid: 1,
			headid: 1,
			iconid: 1,
			_power: 1,
			'hide.38001': 1
		}
		let role = await ctx.dao.role.findOne({_id: rid}, select);
		if (!role) continue;
		rank.push({
			damage,
			name: role.name,
			level: role.level,
			icon: role.iconid,
			power: role._power,
			frameid: role.frameid,
			headid: role.headid,
			id: role.i(),
		})
	}
	// sort
	rank.sort((pre, next) =>{
		return pre.damage > next.damage? -1: 1;
	})
	let nextstagedamage;
	let step = 0;
	for (let i = 0; i < STAGE.length; i++) {
		let {
			DAMGE,
		} = STAGE[i];
		if (ctx.boss.totaldamage < DAMGE) {
			nextstagedamage = DAMGE;
			step = i + 1;
			break;
		}
	}
	if (!nextstagedamage) {
		nextstagedamage = _.last(STAGE).DAMGE;
		step = STAGE.length;
	}
	// 兼容跨服查询对手 军团boss
	let _myrecord = ctx.role && ctx.boss.roles.deepQueryOne('rid', ctx.role.i());
	if (!_myrecord) _myrecord = {num: 0, lastdamage: 0};
	ctx.body = {
		bset: global.gameconfig.battlelegionwarmobboss[config.SEASON],
		buffs,
		step,
		lastdamage: _myrecord.lastdamage,
		totaldamage: ctx.boss.totaldamage,
		nextstagedamage,
		rank,
		chance: {
			num: CHALLENGE_CAST.length - _myrecord.num,
			cast: [],
		}
	}
	let ybnum = CHALLENGE_CAST[_myrecord.num];
	if (ybnum > 0) ctx.body.chance.cast.push({GSID: 38005, COUNT: CHALLENGE_CAST[_myrecord.num]});
}
