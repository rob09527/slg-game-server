'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

/**
 * 奇门幻阵挑战开始
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

	ctx.assert(ctx.bossConfig.expireAt > Date.now(), 'activity expire');
	// 判断次数是否还足够
	ctx.assert(ctx.surplusNum >= 1, 'count not enough'); //

	const { battleset } = ctx.request.body;
	let battle = new ctx.dao.c_battle({
		rid: ctx.role._id,
		type: 'fantasyboss',
		player: await ctx.role.getBattleSet('fantasy'),
	})
	await battle.createEnemy(ctx.bossConfig.bossid).save();

	ctx.body = battle.base();

	// 增加挑战次数
	ctx.role.addItemsNoSave({ gsid: 98001, count: 1 });
	await ctx.role.save()
	//秘境主线任务打点
	await secretTask(ctx, 99553, 1)
}