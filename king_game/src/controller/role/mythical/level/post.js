
'use strict'

const secretTask = require("../../../../model/secretRealmRole/instance/secretTask");
const { hitHere } = require("../../../../util/weektarget");

module.exports = exports = async (ctx, next) => {
	const config = global.gameconfig.mythicalclass[ctx.mythic.class - 1];
	ctx.assert(config, 'invalid mythic');
	ctx.assert(config.MAXLV > ctx.mythic.level, 'level limit');
	//秘境主线任务打点
	await secretTask(ctx, 99555, 1)
	await secretTask(ctx, 99556, 1)

	const items = global.gameconfig.mythicallevel[ctx.mythic.level];
	ctx.assert(items, 'invalid level');

	ctx.role.castItemsNoSave(items);

	ctx.mythic.level++;
	ctx.role.missionInvoke('MYTHIC_LVUP', ctx.mythic.level);
	ctx.role.missionInvoke('MYTHIC_ACTIVE', ctx.mythic.level);

	if (ctx.mythic.level == 1) ctx.mythic.pskill[0]++;
	hitHere(ctx.role, 98780, 1, true);



}