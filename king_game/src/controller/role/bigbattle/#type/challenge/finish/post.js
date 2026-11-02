
'use strict'

const secretTask = require("../../../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async (ctx, next) => {
	if (ctx._enemy_type == 'mboss' && ctx.role.getProp(ctx.chapter.REMARK) < ctx.chapter.COUNTLIMIT) {
		ctx.role.addItemsNoSave({ GSID: ctx.chapter.REMARK, COUNT: 1 })
	}
	else {
		const cast = ctx.chapter.CAST || [{ GSID: 30024, COUNT: 1 }];
		ctx.role.castItemsNoSave(cast);
	}
	if (ctx._enemy_type = 'lmboss' && ctx.chapter.REMARK == undefined) {
		//秘境主线任务打点
		await secretTask(ctx, 99542, 1)
	}
	if (ctx._enemy_type = 'lmboss' && ctx.chapter.REMARK == 90712) {
		//秘境主线任务打点
		await secretTask(ctx, 99569, 1)

	}
	if (ctx._enemy_type = 'yuangu') {
		//秘境主线任务打点
		await secretTask(ctx, 99550, 1)
	}
	if (ctx._enemy_type = 'mboss' && ctx.chapter.REMARK == 90710) {
		//秘境主线任务打点
		await secretTask(ctx, 99543, 1)
	}
	if (ctx._enemy_type = 'mboss' && ctx.chapter.REMARK == 90711) {
		//秘境主线任务打点
		await secretTask(ctx, 99544, 1)
	}

	let { battleid } = ctx.request.body;
	let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
	ctx.assert(battle, 'invalid battleid');
	await battle.cal();
	if (ctx.chapter.MUST_WIN) { // 必须挑战赢的 boss 则必须挑战胜利才算过
		if (battle.result.ret === 'win') {
			ctx.record.totaldamge = 1; // 1 表示击杀
		}
	} else {
		ctx.record.lastdamge = battle.result.rlosthp;
		ctx.record.totaldamge += battle.result.rlosthp;
	}
	if (ctx._enemy_type === 'mboss' && ctx.chapter.BOSSHP <= ctx.record.totaldamge) {//月度副本
		ctx.role.addItemsNoSave({ GSID: 90681, COUNT: 1 })
	}

	ctx.record.last = Date.now();
	ctx.body = {
		result: battle.result,
		last: ctx.record.last,
		damge: ctx.record.lastdamge,
	};
}
