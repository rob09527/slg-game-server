
'use strict'

const {
	DINGJI_SCORE
} = global.gameconfig.others.PVPKING;

module.exports = exports = async ctx =>{
	let {
		battleid,
	} = ctx.request.body;
	ctx.body = {};
	// 战斗计算
		let battle = await ctx.dao.c_battle.findOne({_id: battleid});
		ctx.assert(battle, 'invalid battleid');
		let {
			videolist,
			version,
		} = await battle.calmulti();
		ctx.body.resultlist = videolist;

	// 扣除演武令
		ctx.role.castItemsNoSave({gsid: 30028, count: 2});

	// 请求记分
		let {
			player,
			enemy: target,
		} = battle;
		let mark = {
			rname: player.rname,
			power: player.power,
			level: player.level,
			iconid: player.iconid,
			frameid: player.frameid,
		}
		let {
			targetid,
		} = JSON.parse(battle.mark);
		let params = {
			servid: ctx.role.servid,
			uid: ctx.role.uid,
			rid: targetid,
			result: battle.result.ret,
			video: videolist,
			version,
			mark,
		}
		let data =  await ctx.score_card.recordFn(params);
		let {
			schange,
			locate,			// 定级赛状态
			promotion, 	// 晋级赛状态
			kingpvp,		// 段位信息
			stage,			// 段位编号
			win_streak, 	// 连胜次数
		} = data;
		// 定级赛
		if (locate) ctx.body.locate = locate;
		// 晋级赛
		if (promotion){
			ctx.body.promotion = promotion;
		}else if (kingpvp && kingpvp.promotion) {
			ctx.body.promotion = kingpvp.promotion;
		}
		// 段位信息
		if (kingpvp) {
			ctx.body.stageinfo = {
				schange,
				star: kingpvp.star,
				stage,
			}
			// 更新历史最高段位
			if (!ctx.role.hstage || stage > ctx.role.hstage) ctx.role.hstage = stage;
		}
		ctx.body.win_streak = win_streak; // 增加连胜次数的返回
	// 翻牌
		let reward = [];
		let level = ctx.role.level;
		let pool = global.gameconfig.pvpkingrewardchallenge.filter(({LV: [MIN, MAX]}) =>{
			return level >= MIN && level <= MAX;
		})
		ctx.assert(pool.length > 0, 'reward err');
		let rate = pool.deepMap('W');
		for (let i = 0; i < 3; i++) {
			let {GSID, COUNT: [MIN, MAX]} = pool[ctx.random.inweight(rate)];
			reward.push({GSID, COUNT: ctx.random.between(MIN, MAX)});
		}
		ctx.body.reward = reward.map((item, index) =>{
			if (index == 0 || ctx.role.special.bw > Date.now()) {
				item.real = true;
			}
			return item;
		})
		// 取出已经标记已读的,添加到玩家数据里
		let items = ctx.body.reward.filter(function (item) {
			return item.real;
		})
		ctx.role.addItemsNoSave(items);

	// 英魂守护
		let gsidset = new Set();
		for (let {team} of battle.player.bslist) {
			let gsids = Object.values(team).map(({gsid}) => gsid);
			for (let _gsid of gsids) {
				gsidset.add(_gsid);
			}
		}
		// 王者演武战斗次数
		ctx.zhdpoint('YHSH', ctx.role, gsidset, 90498);

	// 标记发放
		let marks = [
			// 每天挑战次数
			{gsid: 90319, count: 1},
			// 历史挑战次数
			{gsid: 90372, count: 1},
		];
		// 每天挑战胜利次数
		if (battle.result.ret === 'win') {
			marks.push({gsid: 90320, count: 1});
			await ctx.role.zhenbaoMissionInvoke({type: 'win', missionName: "CHALLENGE_KINGPVP"});// 珍宝增幅任务-王者演武胜利
		}
		// 月度活动王者演武活动积分
		marks.push({gsid: 90336, count: battle.result.ret == 'win'? 2: 1})
		ctx.role.addItemsNoSave(marks);
		await ctx.role.save();
		// 清空挑战门票
		await ctx.role.updateOne({$set: {'others.90335.count': 0}});
		// 珍宝-增幅任务-参与王者演武
		await ctx.role.zhenbaoMissionInvoke({missionName: 'CHALLENGE_KINGPVP'});

	// 异步保存录像
		let myVideo = new ctx.dao.video({
			type: 'pvpking', rid: ctx.role._id,
			video: JSON.stringify(videolist),
			version,
			mark: [
				battle.result.ret,
				schange,
				stage,
				kingpvp? kingpvp.star: 0,
				'active',
				target.rname,
				target.power,
				target.level,
				target.iconid,
				target.frameid,
			].join('.'),
		});
		myVideo.save().catch(console.error);
		ctx.body.videoid = myVideo._id.toString();
		ctx.role.dispatchEvent('EVENT_PVP_KING', 1 , {ret:  battle.result.ret});
}

