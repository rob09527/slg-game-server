
'use strict'
const secretTask = require("../../../../../../model/secretRealmRole/instance/secretTask");
const { hitHere } = require("../../../../../../util/weektarget");
/**
 * @author awko
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {

	if (ctx.doneCount) {
		hitHere(ctx.role, 94205, ctx.doneCount, true);
		await ctx.role.missionInvoke('HECHENG_DAILY_HISTORY', ctx.doneCount).save();
		ctx.role.dispatchEvent('EVENT_EQUIP_COMP', ctx.doneCount);
		//秘境主线任务打点
		await secretTask(ctx, 99557, 1)
	}

}
