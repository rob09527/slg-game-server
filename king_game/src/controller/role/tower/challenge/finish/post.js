
'use strict'

const {
	MAX_TOKEN_NUM,
} = global.gameconfig.others.TOWER;
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");
const { hitHere } = require("../../../../../util/weektarget");

module.exports = exports = async (ctx) => {
	let { battleid } = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
	ctx.assert(battle, 'invalid battleid');
	let { result: ret } = await battle.cal();
	ctx.body = { result: ret };
	ret = ret.ret;
	ctx.zhdpoint('ZJD_POINT', ctx.role, 98308); //欢乐砸金蛋-挑战试练塔1次
	ctx.role.missionInvoke('TOWER_TIMES');
	if (ret === 'win') {
		// 更新记录
		let cond = {
			rid: ctx.role._id,
			type: 'tower',
		}
		let upd = {
			$inc: {
				topfloor: 1,
			},
			$set: {
				topfloortime: Date.now(),
				groupid: ctx.role._gameserv.groupid
			},
			$push: {
				record: {
					time: Date.now(),
					floor: ctx.role.tower,
				}
			}
		}
		await ctx.dao.tower.updateOne(cond, upd, { upsert: true });
		// 更新缓存值
		ctx.role.tower++;
		//秘境主线任务打点
		await secretTask(ctx, 99565, 1)
		ctx.role.addItemsNoSave(ctx.config, 'tower');
		ctx.body.items = ctx.config;
		// 七日目标-试练塔通关层数
		hitHere(ctx.role, 94201, ctx.role.tower);
		await ctx.role.save();
		// 跑马灯
		ctx.role.bulletScreen("TOWER", ctx.role.tower);
		// 更新排名
		let rankService = new global.services.RankService('tower', ctx.role._gameserv.groupid);
		await rankService.set(ctx.role.i(), ctx.role.tower);
		// 通知检查排行榜成就进度
		ctx.dao.rankmission.notify('tower', ctx.role.tower, ctx.role.i(), ctx.role._gameserv.groupid).catch(console.error);
		// 试练塔挑战成功通知
		// ctx.role.notifyNextTowerFloor({floor: ctx.role.tower});
		ctx.role.dispatchEvent('EVENT_TOWER', 1, {
			ret: ctx.role.tower,
			tower: ctx.role.tower
		});

		ctx.role[`TOWER_FLOOR_${ctx.role.tower}`] = ctx.role.tower;
	} else {
		//元旦活动 不管输赢都要保存标记 不敢把win了游戏的save操作提出来 怕出bug 因此 在这个地方再加一行
		await ctx.role.save();

		ctx.role[`BATTLE_LOSE_LEVEL`] = ctx.role.level;
	}
	await global.dao.warorder.point(ctx.role, 90564, 1, true);  // 卧龙战令-王者之塔挑战
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
		lper, rper,
		ltper, rtper,
		report,
		seed,
		season,
		rcards,
		lcards,
		result,
		left: {
			info: {
				rname: ctx.role.name,
				level: ctx.role.level,
				iconid: ctx.role.iconid,
				headid: ctx.role.headid,
				frameid: ctx.role.frameid
			},
			'set': battle.player
		},
		right: {
			info: {
				rname: battle.mark,
			},
			'set': battle.enemy
		},
	}
	video = new ctx.dao.video({
		type: ret === 'win' ? 'tower' : 'towerlost',	// 注意,试练塔失败类型与胜利类型不一样
		rid: ctx.role.i(),
		video: JSON.stringify(video),
		mark: battle.mark,
		version,
	})
	video.save().catch(console.error);
	// 返回录像id
	ctx.body.videoid = video.i();
	ctx.body.tower = ctx.role.tower;
	if (ret === 'win') {
		// 赢了插入全局的tower表，显示前3位通关玩家信息
		let record = { rid: ctx.role.i(), time: Date.now(), video: video.i() }
		// 判断是否插入前三记录
		await ctx.dao.gametower.addInRecord({
			type: 'tower',
			floor: ctx.role.tower,
			groupid: ctx.role._gameserv.groupid,
			role: record
		});
	}
}
