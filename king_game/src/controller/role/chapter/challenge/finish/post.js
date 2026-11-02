
'use strict'
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");
const { XS_ZZTJJ_GX } = require("../../../../../util/event/xscleanfn");
const { hitHere } = require("../../../../../util/weektarget");

module.exports = exports = async (ctx) => {
	const config = global.gameconfig.chapter[ctx.role.maxmapid];
	ctx.assert(config, 'invalid chapter');

	let { battleid } = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
	ctx.assert(battle, 'invalid battleid');

	// 不进战斗服
	if (ctx.role.maxmapid < global.gameconfig.others.FIGHT_CHAPTER) {
		ctx.body = {
			result: {
				ret: 'win'
			}
		};
	}
	else {
		await battle.cal();
		ctx.body = { result: battle.result };
	}
	// 战斗结算
	if (ctx.body.result.ret === 'win') {
		await secretTask(ctx, 99568, 1)

		//地图解锁监控
		let taskconfig = global.gameconfig.secretRealmTask[0].find(e => e.TYPEPARAMS == ctx.role.maxmapid)
		if (taskconfig) {
			await secretTask(ctx, taskconfig.TASKTYPE, 1)
		}



		// ctx.role.maxmapid
		// 劝降系统
		// 判断是否有可俘虏武将
		let capture_general;
		for (let city of global.gameconfig.city) {
			let {
				ID,
				GENERAL,
				CHAPTERS,
			} = city;
			// 特殊关卡判断
			if (ctx.role.maxmapid === global.gameconfig.others.SURRENDER.CHAPTER && CHAPTERS.indexOf(ctx.role.maxmapid) >= 0) {
				capture_general = GENERAL;
				break;
			}
			// 判断是否城池的最后一张地图
			let last_chapterid_of_city = CHAPTERS[CHAPTERS.length - 1];
			if (ctx.role.maxmapid < last_chapterid_of_city) break;
			if (ctx.role.maxmapid === last_chapterid_of_city) {
				// 特殊关卡判断
				if (ID === global.gameconfig.others.SURRENDER.EXCLUDE) {
					break;
				}
				capture_general = GENERAL;
				break;
			}
		}
		let _surrender_config = global.gameconfig.surrender.deepQueryOne('GSID', capture_general);


		// 加个chapter的判断,判断最后一关,计算vipbattle的值(加成)
		let openNextGate = global.gameconfig.chapter[ctx.role.maxmapid + 1];
		if (!openNextGate) {
			// 计算新的vip战斗因子
			let factorConfig = global.gameconfig.challengefactor;
			if (factorConfig) {
				let factor = factorConfig.VIP[ctx.role.vip];
				ctx.role.vipbattlefactor = factor;
				ctx.role.markModified('vipbattlefactor');
			}
		}
		// 创建征战boss 异步, 删除旧的征战boss, @author awko
		// const config = global.gameconfig.dboss.deepQueryOne('CHAPTER', ctx.role.maxmapid);
		// if (config) {
		// 	// 已经存在的征战boss关卡,不创建新的boss
		// 	let hasrecord = await ctx.dao.dboss.findOne({rid:ctx.role._id,id:config.ID});
		// 	if (!hasrecord)	ctx.dao.dboss.create({rid: ctx.role._id, id: config.ID}).catch(console.error);
		// }
		// 武门丰碑
		let cur_chapterid = global.gameconfig.maplist[ctx.role._maxmapid];
		ctx.dao.rankmission.notify('main', cur_chapterid, ctx.role.i(), ctx.role._gameserv.groupid).catch(console.error);
		// 过关切图发放奖励
		const next_chapterid = global.gameconfig.maplist[ctx.role._maxmapid + 1];
		ctx.role.mapfinished = true;
		if (global.gameconfig.chapter[next_chapterid]) {
			ctx.role._maxmapid++;
			ctx.role.mapfinished = false;
			ctx.role.chaperupdate = Date.now();
		}
		let rankService = new global.services.RankService('main', ctx.role._gameserv.groupid);
		await rankService.set({
			id: ctx.role.i(),
			score: cur_chapterid,
		})

		// 新增推图活动	
		let rankPushMap = new global.services.RankService('pushmap', ctx.role._gameserv.servid);
		await rankPushMap.set({
			id: ctx.role.i(),
			score: (ctx.role.getItems(99773).count + 1),
		})

		if (capture_general && _surrender_config) {
			capture_general = new ctx.dao.prisoner({
				rid: ctx.role._id,
				servid: ctx.role.servid,
				gsid: capture_general,
				loyal: _surrender_config.LOYAL.BASE,
			})
			await capture_general.save();
			ctx.body.srender = _surrender_config
		}
		let rewards = ctx.config.REWARDS;
		const vipConfig = global.gameconfig.vip;
		//新增推图数量
		ctx.role.addItemsNoSave({ gsid: 99773, count: 1 });
		ctx.role.addItemsNoSave(rewards, { main: 'chapter', sec: 'mainthread' });
		ctx.role.dispatchEvent('EVENT_CHAPTER_UP', 1, { ret: next_chapterid });
		ctx.body.items = rewards;
		console.log(ctx.role.rno, 'CHAPTER UP', next_chapterid);
		ctx.hook.end(EVENT_ENUM.CHAPTER_UP);
		// 过图自动推荐好友
		let arf = ctx.role.autoRecommendFriends.bind(ctx.role, next_chapterid, next_chapterid);
		Promise.resolve().then(arf).catch(console.error);
		// 七日目标-征战通关关卡数
		hitHere(ctx.role, 94208, 1, true);
	} else {
		// 挑战失败埋点
		if (ctx.role.maxmapid > 10610) {// 新增逻辑 通过这个关卡才进行失败埋点
			ctx.role.addItemsNoSave(90458, { main: 'chapter', sec: 'mainthread' });
		}
		// 触发推荐礼包
		// ctx.role[`BATTLE_LOSE_LEVEL`] = ctx.role.level;
		ctx.role[`CHAPTER_LOSE`] = ctx.role.maxmapid;
	}
	await ctx.role.save();

}
