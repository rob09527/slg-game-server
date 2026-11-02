
'use strict'

const post = require("../finish/post");

module.exports = exports = async (ctx, next) => {
	let {
		index = 0,
		mode = 0,
		target,
	} = ctx.request.body;
	//rob国战脚本 生产模式需要释放以下代码。国战脚本 屏蔽
	if (mode === 1) {
		// 排除挑战自身的情况
		ctx.assert(target != ctx.role._id, 'no challenge itself');
	} else {
		// 为0 则挑战匹配对手
		ctx.assert(ctx.cache, 'no target1');
		target = ctx.cache.targets[+index];
		ctx.assert(target === ctx.request.body.target, 'invalid target');
	}
	//rob国战脚本 
	const free = ctx.role.getProp(90151);
	if (free < 3) {	// 增加免费使用次数
		ctx.role.addItemsNoSave({ gsid: 90151, count: 1 });
	} else {	// 消耗演武令
		ctx.role.castItemsNoSave({ gsid: 30028, count: 1 });
	}

	const player = await ctx.role.getBattleSet('pvpatt');
	const battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'pvp',
		player,
		mark: target,
	})
	let enemy;
	if (target.startsWith('robot')) {
		const robotid = parseInt(target.slice(6));
		const config = global.gameconfig.robotpvp.deepQueryOne('ID', robotid);
		ctx.assert(config, 'invalid rid');
		enemy = ctx.dao.role.robotGenerator(config);
	} else {
		const role = await ctx.dao.role.findOne({ _id: target });
		let battleset = await role.getBattleSet('pvpdef');
		enemy = {
			level: role.level,
			battleset,
		}
		const skills = await ctx.dao.zbdepot.getAllZbSkill({ rid: target });
		battle.rcards.push(...skills.map(id => ({ id })));
	}
	await battle.createEnemy(enemy.battleset);
	battle.season.right = enemy.level;
	await ctx.role.missionInvoke('JINGJICHANG_DAILY_HISTORY').save(); // todo 发送消息？
	await battle.save();
	ctx.body = battle.base();
	//rob国战脚本
	// ctx.request.body = {
	// 	battleid: ctx.body.battleid
	// }
	// await post(ctx)
	//rob国战脚本end
}
