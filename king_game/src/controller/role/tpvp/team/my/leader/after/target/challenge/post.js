
'use strict'

module.exports = exports = async function (ctx, next) {
	const {
		tid,
		index = 0
	} = ctx.request.body;
	// 体力消耗
	let sta = ctx.team.getSta();
	ctx.assert(sta > 0, 'no stamina');
	ctx.team._sta.val++;
	const {MAXSTA} = global.gameconfig.others.PVPTEAM;
	if (sta >= MAXSTA) ctx.team._sta.last = Date.now();
	// 请求目标队伍信息
	let params = {
		teamid: ctx.team.i(),
		servid: ctx.team.servid,
	}
	let {list} = await ctx.team.fetchTarget();
	let {
		teamid,
		servid,
	} = list[Number.parseInt(index)];
	let targetlist = [];
	// 请求队伍成员信息
	if (teamid.startsWith('robotteam')) {	// 机器人队伍
		let [, index] = teamid.split('_');
		let config = global.gameconfig.robotteam[Number.parseInt(index)];
		ctx.assert(config, 'invalid rteam');
		for (let robotid of config.ROBOTS) {
			let robot = global.gameconfig.robotpvp.deepQueryOne('ID', robotid);
			ctx.assert(robot, 'invalid rtarget');
			let {
				LV: level,
				NAME: rname,
				ICON: iconid,
			} = robot;
			let {
				battleset,
			} = ctx.dao.role.robotGenerator(robot);
			targetlist.push({
				zblist:[],
				info: {
					servid: ctx.team.servid,
					rname,
					level,
					iconid,
				},
				'set': {team: battleset.team},
			})
		}
	}else{	// 玩家队伍
		targetlist = await ctx.dao.pvpteam.findOne({_id: teamid});
		//只要参赛的玩家 不区分自己创建或加入他人队伍 需要更新PVP_TEAM_HISTORY 标记,只需要参与即可，每次自增1,不能批量自增? why?
		const targert = targetlist ;
	
		targetlist = await targetlist.getFellowBattleList();
		if(targetlist.length == 3){
			await targert.updateFellowPlayer();
		}
	}
	ctx.assert(targetlist.length == 3, 'invalid target');
	// 获取我方成员信息
	let fellowlist = await ctx.team.getFellowBattleList();
	ctx.assert(fellowlist.length == 3, 'invalid fellow');
	//只要参赛的玩家 不区分自己创建或加入他人队伍 需要更新PVP_TEAM_HISTORY 标记,只需要参与即可，每次自增1,不能批量自增? why?
	await ctx.team.updateFellowPlayer(ctx.role.i());
	// 战斗计算
	let videolist = [];
	let battlelist = [];
	for (let i = 0; i < 3; i++) {
		let left = fellowlist[i];
		let right = targetlist[i];
		let battle = new ctx.dao.c_battle({
			type: 'pvpteam',
			rid: ctx.team.i(),
			player: left.set,
		})
		battle.season.left = left.info.level;
		await battle.createEnemy(right.set);
		// todo set battle.season.left
		battle.season.right = right.info.level;
		battle.rcards = right.zbskill ? right.zbskill.map(id => ({id})):[];
		battle.lcards = left.zbskill ? left.zbskill.map(id => ({id})):[];
		await battle.save();
		// 加入数组等待计算
		battlelist.push(battle.cal());
		// 录像放入数组
		videolist.push({
			left,
			right,
			rcards:battle.rcards,
			lcards:battle.lcards,
			seed: battle.seed,
			season: battle.season,
		})
	}
	// 并发计算
	battlelist = await Promise.all(battlelist);
	// 录像版本
	let video_version = battlelist[0].result.version;
	for (let i = 0; i < battlelist.length; i++) {
		let {
			result: {
				ret,
				lper, rper,
				ltper, rtper,
				report,
				version = 0,
			}
		} = battlelist[i];
		let video = videolist[i];
		video.lper = lper;
		video.rper = rper;
		video.ltper = ltper;
		video.rtper = rtper;
		video.report = report;
		video.result = ret;
	}
	// 请求算分
	params = {...params, ...{index, videolist, version: video_version}};
	let {score, change, win} = await ctx.team.videoSave(params);

	ctx.body = {
		competition:{
			stamina: ctx.team.getSta(),
			teamscore: score,
		},
		videoinfo: videolist,
	}
	//
	await ctx.team.save();
	// 保存录像-自己的。
	let videostr = JSON.stringify(videolist);
	let myVideos  = new ctx.dao.video({type: 'teampvp', video: videostr, rid: ctx.team._id, version: video_version});
	myVideos.mark = [
		// 胜负
		win? 'win': 'lose',
		// 挑战后总积分
		score,
		// 挑战后变动积分
		change,
		// 目标服务器id
		servid,
		// 目标队伍id
		teamid,
	].join('.');
	// 异步保存录像
	myVideos.save().catch(console.error);
	// 返回录像id
	ctx.body.videoid = myVideos.i();
	await ctx.role.missionInvoke('PVP_TEAM_HISTORY').save();
	ctx.role.dispatchEvent('EVENT_PVP_TEAM', 1 , {ret:  win? 'win': 'lose'});
}
