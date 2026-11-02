
'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async ctx => {
	ctx.body = {};
	// 获取角色信息
	let player = ctx.role.avatarInfo();
	player.bslist = [];
	for (let i = 1; i <= 2; i++) {
		let bs_mark = `kingpvp${i}`;
		if (!ctx.role.battlearr[bs_mark]) break;
		let bs = await ctx.role.getBattleSet(bs_mark);
		bs.index = i - 1;
		player.bslist.push(bs);
	}

	// 请求对手信息
	// 请求对手积分卡信息
	let params = {
		servid: ctx.role.servid,
		uid: ctx.role.uid,
	}
	let data = await ctx.score_card.targetFn(ctx.mygroup.groupmark);
	let target;
	let rcards = [];
	if (data.rid.startsWith('robot')) {
		let robotid = Number.parseInt(data.rid.slice(6));
		let config = global.gameconfig.robotkingpvp.deepQueryOne('ID', robotid);
		ctx.assert(config, 'invalid config');
		let {
			TEAMLEN,
			TEAMLIST,
			...others
		} = config;
		config = others;
		let bslist = [];
		for (let i = 0; i < TEAMLIST.length; i++) {
			let GENERALS = TEAMLIST[i];
			// 兼容
			let tmp = { ...config, GENERALS };
			let { battleset } = ctx.dao.role.robotGenerator(tmp);
			battleset.index = i;
			bslist.push(battleset);
		}
		target = {
			rname: config.NAME,
			level: config.LV,
			iconid: config.ICON,
			frameid: 51001, // hardcode
			power: config.POWER,
			bslist,
		}
	} else {
		// 请求获取对手阵容信息
		params = {
			uid: data.uid,
			sid: data.servid,
		}
		target = await ctx.dao.role.getOtherInfoAndBattleSet({ uid: data.uid, servid: data.servid }, 'kingpvp');
		target.bslist = target.battleset;
		target.battleset = undefined; // 两边结构不一样,相对target接口
		// 获取对手的珍宝技能
		rcards = await ctx.dao.role
			.findOne({ uid: data.uid, servid: data.servid }, { _id: 1 })
			.then(({ _id: rid }) => ctx.dao.zbdepot.getAllZbSkill({ rid }))
			.then(list => list.map(id => ({ id })))
	}

	// 保存战斗数据
	let mark = {
		targetid: data.rid,
	}
	let battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'pvpking',
		player,
		enemy: target,
		mark: JSON.stringify(mark),
	})
	battle.rcards = rcards;
	battle.season.left = player.level;
	battle.season.right = target.level;
	await battle.save();
	//秘境主线任务打点
	await secretTask(ctx, 99546, 1)
	// 整理返回信息
	ctx.body = battle.base()
	// ctx.body = {
	// 		seedlist: battle.seedList(5),
	// 		battleid: battle.i(),
	// 		season: battle.season.season,
	// }
}
