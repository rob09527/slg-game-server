
'use strict'

const { hitHere } = require("../../../../../util/weektarget");

module.exports = exports = async (ctx) => {
	let { battleid } = ctx.request.body;

	// 查找目标
	let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
	let target = battle.mark;
	if (target.startsWith('robot')) {
		// 机器人默认1000
		target = {
			pvpscore: 1000,
		}
	} else {
		target = await ctx.dao.role.findOne({ _id: target });
	}
	ctx.assert(target, 'invalid target');

	// 战斗计算
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	let { result: ret } = battle;
	ctx.body = { result: ret };
	ctx.body.reward = [];

	// 记分
	ctx.role.pvpscore = ctx.role.pvpscore || 1000;	// 默认1000
	target.pvpscore = target.pvpscore || 1000;
	let base_self = 20 + Math.max(Math.round((ctx.role.pvpscore - 1000) / 50), 0) * 2;
	let base_tar = 20 + Math.max(Math.round((target.pvpscore - 1000) / 50), 0) * 2;
	if (ret.ret === 'win') {
		base_self = 20;
		base_tar = -base_tar;
	} else {
		base_tar = 20;
		base_self = -base_self;
	}
	const minus = Math.round((ctx.role.pvpscore - target.pvpscore) / 20);
	base_self -= minus;
	base_tar += minus;
	if (ret.ret === 'win') {
		base_self = Math.max(base_self, 0);
		base_tar = Math.min(base_tar, 0);
	} else {
		base_self = Math.min(base_self, 0);
		base_tar = Math.max(base_tar, 0);
	}
	ctx.role.pvpscore += base_self;
	target.pvpscore += base_tar;
	let now = Date.now();
	ctx.role.pvpupdate = now;
	target.pvpupdate = now;
	ctx.body.spoints = ctx.role.pvpscore;
	ctx.body.schange = base_self;
	ctx.body.epoints = target.pvpscore;
	ctx.body.echange = base_tar;

	// 翻牌
	ctx.body.reward = ctx.role.pvpFanPai();

	// 标记发放
	if (ret.ret === 'win') {
		ctx.role.pvpwinchain = ctx.role.pvpwinchain || 0;
		ctx.role.pvpwinchain++;
		ctx.role.missionInvoke('PVP_CHALLENGE_WIN');
	} else {
		ctx.role.pvpwinchain = 0;
	}
	const mark = [{ gsid: 90254, count: ret.ret == 'win' ? 2 : 1 }];
	const highestScore = ctx.role.getItems(90456).count; // 最高
	if (highestScore < ctx.role.pvpscore) { // 小于现在的分数，更新最高分数
		mark.push({
			GSID: 90456,
			COUNT: ctx.role.pvpscore - highestScore
		});
	}
	// 演武竞技活动任务
	ctx.role.addItemsNoSave(mark);
	// 职业任务
	// ctx.jobtask({mark:90379, rid: ctx.role._id}).catch(console.error);
	// 七日目标-演武场挑战次数
	hitHere(ctx.role, 94202, 1, true);

	// 英魂守护
	let gsidlist = new Set(Object.values(battle.player.team).map(({ gsid }) => gsid));
	//演武战斗次数
	ctx.zhdpoint('YHSH', ctx.role, gsidlist, 90496);
	// 演武战斗胜利次数
	if (ret.ret === 'win') {
		ctx.zhdpoint('YHSH', ctx.role, gsidlist, 90497);

		ctx.zhdpoint('ZJD_POINT', ctx.role, 98302); //欢乐砸金蛋-个人演武胜利1次

		ctx.zhdpoint('SDBJ_POINT', ctx.role, 98202, 1); //圣诞笔记-个人演武胜利
		await global.dao.warorder.point(ctx.role, 90567);  // 卧龙战令-个人演武胜利

		await ctx.role.zhenbaoMissionInvoke({ type: 'win', missionName: "CHALLENGE_PVP" });// 珍宝增幅任务-个人演武胜利
	}
	await global.dao.warorder.point(ctx.role, 90573);  // 卧龙战令-终极任务-个人演武挑战
	ctx.zhdpoint("DBRW", ctx.role, 90581); // 夺宝任务-演武场战斗

	// 结果保存
	let rankService = new global.services.RankService('pvp', ctx.role._gameserv.groupid);
	ctx.role.addItemsNoSave(95008); // 个人演武挑战次数
	await ctx.role.save();
	// 珍宝-增幅任务-参与个人演武
	await ctx.role.zhenbaoMissionInvoke({ missionName: 'CHALLENGE_PVP' });
	await rankService.set({
		id: ctx.role.i(),
		score: ctx.role.pvpscore
	});
	if (ctx.cache) ctx.cache.remove();
	ctx.role.notifyPvpScoreChange(ctx.role.pvpscore, base_self, true);
	// 机器人不需要保存,不需要通知
	if (target.uid) {
		// 对手积分更新使用 原子操作，避免对手同时被打导致 被锁，save会报错
		await ctx.dao.role.updateOne({ _id: target._id }, {
			$inc: {
				pvpscore: base_tar
			},
			$set: {
				pvpupdate: now
			}
		});
		await rankService.set({
			id: target.i(),
			score: target.pvpscore
		});
		target.notifyPvpScoreChange(target.pvpscore, base_tar);
	}

	// 录像保存
	let {
		seed,
		season,
		rcards,
		lcards,
		result: {
			version,
			ret: result,
			lper, rper,
			ltper, rtper,
			report,
		}
	} = battle;
	let video = {
		seed,
		result,
		season,
		lper, rper,
		ltper, rtper,
		report,
		left: {
			info: {
				rname: ctx.role.name,
				level: ctx.role.level,
				iconid: ctx.role.iconid,
				headid: ctx.role.headid,
				frameid: ctx.role.frameid
			},
			'set': battle.player,
		},
		right: {
			info: {
				rname: target.name,
				level: target.level,
				iconid: target.iconid,
				headid: target.headid,
				frameid: target.frameid
			},
			'set': battle.enemy,
		},
		lcards,
		rcards
	}
	let videostr = JSON.stringify(video);
	let myVideo = new ctx.dao.video({
		type: 'pvp',
		rid: ctx.role.i(),
		video: videostr,
		mark: [video.result, ctx.role.pvpscore, base_self].join('.'),
		version,
	});
	await ctx.role.dispatchEvent('EVENT_PVP_SOLO', 1, { ret: ret.ret });

	// 异步保存
	myVideo.save().catch(console.error);
	ctx.body.videoid = myVideo.i();
	if (!target.uid) return;
	ctx.dao.video.create({
		type: 'pvp', rid: target.i(),
		video: videostr,
		mark: [video.result === 'win' ? 'lose' : 'win', target.pvpscore, base_tar].join('.'),
		version,
	}).catch(console.error);
}
