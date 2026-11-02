
'use strict'
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");
const { hitHere } = require("../../../../../util/weektarget");
/**
 * @author awko 改回去了
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
	//
	const count = parseInt(ctx.request.body.count) || 1;
	let equip = ctx.request.body.equip;
	let items = global.gameconfig.equipcomp[equip];
	ctx.assert(items, 'invalid equip');

	const castitems = ctx.updateEquip(equip, count);
	ctx.assert(castitems, 'not enough');

	ctx.body = {
		items: [{ gsid: equip, count: count }],
		castitems
	};
	hitHere(ctx.role, 94205, 1, true);
	await ctx.role.missionInvoke('HECHENG_DAILY_HISTORY', count).save();
	ctx.role.dispatchEvent('EVENT_EQUIP_COMP', count);
	//秘境主线任务打点
	await secretTask(ctx, 99557, 1)
}
