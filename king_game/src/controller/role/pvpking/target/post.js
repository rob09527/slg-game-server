
'use strict'

const {
	REFRESH_INTERVAL_MIN,
} = global.gameconfig.others.PVPKING;

const ref_interval = REFRESH_INTERVAL_MIN * 60 * 1000;

module.exports = exports = async ctx =>{
	let {force} = ctx.request.body;
	// 手动刷新
	if (force) {
		let kprefresh = ctx.role.kprefresh || 1111111111111;
		// 判断间隔
		ctx.assert(Date.now() > kprefresh + ref_interval, 'time limit');
		ctx.role.kprefresh = Date.now();
		// ???,清空门票
		let mark_num = ctx.role.getItems(90335).count;
		if (mark_num > 0) ctx.role.castItemsNoSave({gsid: 90335, count: mark_num});
		await ctx.role.save();
	}
	let data = await ctx.score_card.targetFn(ctx.mygroup.groupmark,force);
	ctx.body = data;
	ctx.body.time = ctx.role.kprefresh || 1;
	let {
		rid,
		servid,
		uid,
		star,
		stage
	} = data;
	if (rid.startsWith('robot')) {
		// 生成机器人信息
		let robotid = parseInt(rid.slice(6));
		let robot = global.gameconfig.robotkingpvp.deepQueryOne('ID', robotid);
		ctx.assert(robot, 'invalid rtarget');
		let {
			TEAMLEN,
			TEAMLIST,
			...others
		} = robot;
		robot = others;
		// 机器人默认跟自己同一个服
		ctx.body.servid = ctx.role.servid;
		ctx.body.robot = 1;
		ctx.body.iconid = robot.ICON;
		ctx.body.frameid = 10003;
		ctx.body.level = robot.LV;
		ctx.body.rname = robot.NAME;
		ctx.body.power = robot.POWER;
		ctx.body.stage = robot.STAGE;
		ctx.body.battleset = [];
		for (let GENERALS of TEAMLIST) {
			// 兼容旧方法
			let tmp = {...robot, GENERALS};
			let {battleset} = ctx.dao.role.robotGenerator(tmp);
			ctx.body.battleset.push(battleset);
		}
	}else{

		// 基本信息
		// 返回玩家的星级和段位
		ctx.body.star = star;
		ctx.body.stage = stage;
		const oRole = await ctx.dao.role.getOtherInfoAndBattleSet({uid, servid}, 'kingpvp');
		Object.assign(ctx.body, oRole);
	}
}
