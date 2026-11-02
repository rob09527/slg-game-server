
'use strict'
const { hitHere } = require("../../../../../../../util/weektarget");

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.record, 'challenge first');

	ctx.record.damges += ctx.record.lastdamge;
	ctx.boss.totaldamges += ctx.record.lastdamge;
	ctx.boss.last = Date.now();
	// 新七日目标，军团挑战次数
	hitHere(ctx.role, 98620, 1, true);
	ctx.role.missionInvoke('LEGION_FIGHT');
	// 复制上次挑战日志
	let cond = {
		legion: ctx.legion._id,
		rid: ctx.role._id,
		bossindex: ctx.boss.index,
		// 非扫荡记录
		farm: {$exists: 0},
	}
	let lastlog = await ctx.dao.c_lbchallengelog.find(cond).sort({_id: -1}).limit(1);
	lastlog = lastlog[0];
	if (lastlog) {
		lastlog = lastlog.toJSON();
		let {
			_id,
			__v,
			create,
			...copydata
		} = lastlog;
		let farmlog = new ctx.dao.c_lbchallengelog(copydata);
		farmlog.farm = true;
		farmlog.create = Date.now();
		await farmlog.save();
	}
}