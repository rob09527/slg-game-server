
'use strict'

function find_alive_team(bslist) {
	return bslist.find(({team}) =>{
		let alive_general = Object.values(team).find(general => general.hppercent > 0);
		return !!alive_general;
	})
}

module.exports = exports = async (ctx, next) =>{
	ctx.body = {};
	ctx.assert(ctx.cache, 'no targets');
	let {
		index = 0,
		target: select_target,
	} = ctx.request.body;
	index = Number.parseInt(index);
	// 获取对手信息
		let target = ctx.cache.targets[index];
		ctx.assert(target === select_target, 'diff target');
		if (target.startsWith('robot')) {
			let [, robotid] = target.split('_');
			let config = global.gameconfig.robotmpvp.deepQueryOne('ID', Number.parseInt(robotid));
			ctx.assert(config, 'invalid rtarget');
			target = ctx.dao.role.robotGenerator(config);
			target.bslist = target.battleset;
			delete target.battleset;
			target.bslist.forEach((set, index) =>{
				set.index = index;
			})
		}else{
			target = await ctx.dao.role.findOne({_id: target});
			ctx.assert(target, 'invalid target');
			let tmp = target.avatarInfo();
			tmp.bslist = [];
			for (let i = 1; i <= 3; i++) {
				if (!target.battlearr[`multipvp${i}`]) break;
				let bs = await target.getBattleSet(`multipvp${i}`, 'reson');
				bs.index = i - 1;
				tmp.bslist.push(bs);
			}
			// 挂载玩家对象
			ctx.target = target;
			target = tmp;
		}
		// 初始化血量万分比
		target.bslist.forEach((set, index) => {
			set.index = index;
			Object.values(set.team).forEach(general => general.hppercent = 10000)
		});

	// 获取角色信息
		let player = ctx.role.avatarInfo();
		player.bslist = [];
		for (let i = 1; i <= 3; i++) {
			if (!ctx.role.battlearr[`multipvp${i}`]) break;
			let bs = await ctx.role.getBattleSet(`multipvp${i}`, 'reson');
			// 初始化血量万分比
			for (let general of Object.values(bs.team)) {
				general.hppercent = 10000;
			}
			bs.index = i - 1;
			player.bslist.push(bs);
		}

	// 车轮战
		let win;
		let resultlist = [];
		let videolist = [];
		let video_version;
		while(true) {
			// 检查双方是否还有队伍存活
			let player_set = find_alive_team(player.bslist);
			let target_set = find_alive_team(target.bslist);
			if (!player_set) {
				win = false;
				break;
			}
			if (!target_set) {
				win = true;
				break;
			}
			//  战斗计算
			let battle = new ctx.dao.c_battle({
				rid: ctx.role._id,
				type: 'pvpmulti',
				player: player_set,
			})
			await battle.createEnemy(target_set);
			battle.season.right = target.level;
			await battle.save();
			await battle.cal();
			let {
				lper,
				rper,
				ltper,
				rtper,
				report,
				version,
			} = battle.result;
			battle.result.ret = ltper >= rtper? 'win': 'lose';
			await battle.save();
			// 设置录像版本
			if (!video_version) video_version = version;
			// 录像正文
			let video = {
				result: battle.result.ret,
				seed: battle.seed,
				season: battle.season,
				lcards:battle.lcards,
				rcards:battle.rcards,
				left: {
					info: {
						rname: player.rname,
						level: player.level,
						iconid: player.iconid,
					},
					'set': player_set,
				},
				right: {
					info: {
						rname: target.rname,
						level: target.level,
						iconid: target.iconid,
					},
					'set': target_set,
				},
				lper, rper,
				ltper, rtper,
				report,
				id: 'fake_video_id',
			}
			videolist.push(JSON.stringify(video));
			// 记录血量
			for (let [pos, hppercent] of Object.entries(lper)) {
				hppercent = battle.result.ret === 'win'? hppercent: 0;
				player_set.team[pos].hppercent = hppercent;
			}
			for (let [pos, hppercent] of Object.entries(rper)) {
				hppercent = battle.result.ret === 'win'? 0: hppercent;
				target_set.team[pos].hppercent = hppercent;
			}
		}
		win = win? 'win': 'lose';
		// for target video mark
		videolist = videolist.map(video => JSON.parse(video));
		videolist = JSON.stringify(videolist);
		ctx.body.resultlist = videolist;

	// 记分
		let my_score = ctx.role.pvpmultiscore;
		// 机器人默认1000
		let target_score = ctx.target? ctx.target.pvpmultiscore: 1000;
		let base_self = 20 + Math.max(Math.round((my_score - 1000) / 50), 0) * 2;
		let base_tar = 20 + Math.max(Math.round((target_score - 1000) / 50), 0) * 2;
		if (win === 'win') {
			base_self = 20;
			base_tar = -base_tar;
		}else{
			base_tar = 20;
			base_self = -base_self;
		}
		const minus = Math.round((my_score - target_score) / 20);
		base_self -= minus;
		base_tar += minus;
		if (win === 'win') {
			base_self = Math.max(base_self, 0);
			base_tar = Math.min(base_tar, 0);
		}else{
			base_self = Math.min(base_self, 0);
			base_tar = Math.max(base_tar, 0);
		}
		my_score += base_self;
		target_score += base_tar;
		ctx.body.spoints = my_score;
		ctx.body.schange = base_self;
		ctx.body.epoints = target_score;
		ctx.body.echange = base_tar;
		// 保存分数
		ctx.role.pvpmultiscore = my_score;
		// 更新目标积分
		if (ctx.target) await ctx.target.updateOne({$set: {pvpmultiscore: target_score}});

	// 扣除演武令
		ctx.role.castItemsNoSave({gsid: 30028, count: 2});

	// 翻牌
		ctx.body.reward = ctx.role.pvpFanPai();
		await ctx.role.save();

	// 标记发放
		ctx.role.dispatchEvent('EVENT_PVP_MULTI', 1 ,  {ret: win});

	// 保存录像
		let mark = [
			win,
			my_score,
			base_self,
			'active',
			target.rname,
			target.power,
			target.level,
			target.iconid,
			target.frameid,
		]
		let myVideo = await ctx.dao.video.create({
			type: 'pvpmulti', rid: ctx.role._id,
			video: videolist,
			version: video_version,
			mark: mark.join('.'),
		})
		ctx.body.videoid = myVideo._id.toString();
		// 机器人不保存录像
		if (!ctx.target) return;
		ctx.dao.video.create({
			type: 'pvpmulti', rid: ctx.target._id,
			video: videolist,
			version: video_version,
			mark: [
				win === 'win'? 'lose': 'win',
				target_score,
				base_tar,
				'positive',
				player.rname,
				player.power,
				player.level,
				player.iconid,
				player.frameid
			].join('.'),
		}).catch(console.error);
}
