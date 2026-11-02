
'use strict'

module.exports = exports = async (ctx, next) =>{
	const config = global.gameconfig.mythicalclass[ctx.mythic.class - 1];
	ctx.assert(config, 'invalid class');
	ctx.assert(ctx.mythic.level >= config.MAXLV, 'level limit');
	const nextclass = global.gameconfig.mythicalclass[ctx.mythic.class];
	ctx.assert(nextclass, 'nmore class');
	ctx.role.castItemsNoSave(nextclass.ITEMS);
	
	ctx.mythic.pskill[ctx.mythic.class] = 1;
	ctx.mythic.class++;

	// 为了触发推荐礼包
	ctx.role[`MYTHICAL_CLASS_LV_${ctx.mythic.level}`] = ctx.mythic.level;
}