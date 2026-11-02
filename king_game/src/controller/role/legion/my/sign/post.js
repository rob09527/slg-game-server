
'use strict'

module.exports = exports = async (ctx, next) =>{
	let max_time = 1;
	if (ctx.role.special.gz > 0){
		max_time += global.gameconfig.recharge.specialgz.LEGION_SIGN || 0;
	}
	if (ctx.role.special.zz > 0){
		max_time += global.gameconfig.recharge.specialzz.LEGION_SIGN || 0;
	}
	const { type = 1 } = ctx.request.body;
	ctx.assert(ctx.role.getItems(90266).count < max_time, 'already sign');
	let lm_add_rate = global.gameconfig.others.LEGION.RIGHT_ADD_RATE;
	const legionSign = gameconfig.legionsign[type];
	ctx.assert(legionSign, 'invalid type');

	let rate = (ctx.role.special.lm >= Date.now()? lm_add_rate: 0) / 100;
	//let season_add = 0;
	// let {season} = ctx.bseason(); 
	// if (season == 1) season_add = global.gameconfig.others.BATTLESEASON.VALS[season - 1];
	// rate += season_add / 100;

	ctx.body = {
		exp: legionSign.EXP,
		score: legionSign.SCORE,
		castitems: legionSign.COSUME,
		reward:legionSign.ITEMS.map( ({GSID, COUNT}) => ({GSID, COUNT: Math.floor(COUNT * (1 + rate))}))
	};

	const out = [
		{GSID: 90266, COUNT: 1},
	].append(ctx.body.reward);
	if (legionSign.COSUME){
		ctx.role.castItemsNoSave(legionSign.COSUME);
	}
	ctx.role.addItemsNoSave(out, {main: 'legion', sec: 'sign'});
	ctx.role.missionInvoke('LEGION_SIGN');

	const config = global.gameconfig.legionlevel[ctx.legion.level - 1];
	let changeExp = 0;
	const lv = ctx.legion.level;
	if (config.EXPLIMIT > ctx.legion._expdaily) {
		changeExp = ctx.body.exp;
	}
	if (ctx.legion._dailytime >= ctx.legion.mpnum){
		ctx.body.score = 0;
	}

	const $inc = {
		_expdaily: changeExp,
		_exp: changeExp,
		_dailytime: 1,
		score: ctx.body.score
	};
	const $set = {

	};

	const {LEVEL, SCORE} = gameconfig.legionpvp.REQUIRE;
	
	// 先更新积分数
	await ctx.dao.legion.updateOne({_id: ctx.legion._id}, { $inc });

	// 查询更新过后
	ctx.legion = await ctx.dao.legion.findOne({_id: ctx.role.legion});
	if (ctx.body.score && ctx.legion.level >= LEVEL && ctx.legion.score >= SCORE && ctx.role._gameserv.groupstart < Date.now()){ // 报名军团战逻辑

		const MAX_AVA_TIMES = gameconfig.legionpvp.CONFIG.MAX_AVA_TIMES; // 单周最大匹配
		ctx.legion.pvpinfo = ctx.legion.pvpinfo || {};
		ctx.legion.pvpinfo.availableTimes = ctx.legion.pvpinfo.availableTimes || 0;
		console.log('inc legion  MAX_AVA_TIMES', ctx.legion.pvpinfo, MAX_AVA_TIMES);
		if (ctx.legion.pvpinfo.availableTimes < MAX_AVA_TIMES) {
			console.log('inc legion availableTimes')
			//$set['pvpinfo.availableTimes'] = ctx.legion.pvpinfo.availableTimes + MAX_AVA_TIMES; // 添加下周的门票（这里不用原子操作,避免同时签到发重
			//$set['pvpinfo.lastRegister'] = Date.now();
			ctx.legion.pvpinfo.availableTimes += MAX_AVA_TIMES; // 添加下周的门票（这里不用原子操作,避免同时签到发重
			ctx.legion.pvpinfo.lastRegister = Date.now();
			// 后面有save进行存储
		}
	}
	
	if (changeExp && ctx.legion.level > lv){ // 升级检测
		ctx.dao.c_legionlog.create({legion: ctx.legion._id, event: 'legionlvup', params: [ctx.legion.level]}).catch(console.error);	// async
		// 军团升级推送
		const msg = {type: 'legion_upgrade', content: ctx.legion.level };
		ctx.legion._members.forEach(item => {
			pushClient(item.rid, msg);
		})
	}
	ctx.body.legion =  await ctx.legion.base();
	// 返回解锁配置
	ctx.body.legion.unlock = ctx.unlock;

	// 祭祀日志
	ctx.dao.c_legionsignlog.create({
		legion: ctx.legion._id,
		type,
		rid: ctx.role._id,
		name: ctx.role.name,
		exp: changeExp,
		score: ctx.body.score,
	}).catch(console.error);
	await global.dao.warorder.point(ctx.role, 90566);  // 卧龙战令-军团签到
	ctx.zhdpoint("DBRW", ctx.role, 90584); // 夺宝任务-军团签到
	ctx.zhdpoint("ZJD_POINT", ctx.role, 98304); // 欢乐砸金蛋-军团签到
	await ctx.role.save();
	await ctx.legion.save();
}
