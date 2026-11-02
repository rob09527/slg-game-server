
'use strict'

const {hitHere} = require("../../../../util/weektarget")

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.mythic.level >= 1, 'mythic nexists');

	const index = parseInt(ctx.request.body.skillindex);
	ctx.assert(typeof index === 'number', 'invalid index');

	const config = global.gameconfig.mythicalclass[ctx.mythic.class - 1];
	const level = ctx.mythic.pskill[index];
	ctx.assert(config, 'invalid class');
	ctx.assert(config.PSK[index] > level, 'level limit');
	
	const skill = global.gameconfig.mythical[ctx.request.body.mythic];
	ctx.assert(skill, 'invalid mythic');

	const items = global.gameconfig.mythicalskill[skill[index]][level];
	ctx.assert(items, 'invalid level');

	ctx.role.castItemsNoSave(items);
	ctx.mythic.pskill[index]++;
	hitHere(ctx.role, 98781, 1, true);
}