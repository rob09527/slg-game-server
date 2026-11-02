/**
 * 淬炼
 */
'use strict'

module.exports = async ctx =>{
	let {
		consumegsid,
	} = ctx.request.body;
	let config = global.gameconfig.soulstone[ctx.stone.gsid];
	ctx.assert(config, 'invalid stonegsid');
	ctx.assert(config.STAR >= 5, 'star 2low');
	let {
		CAST,
		W: soultype,
	} = global.gameconfig.soulstone_others.RESET_CAST[consumegsid];
	
	ctx.role.castItemsNoSave(CAST);
	// 随机光/暗
	soultype = ctx.random.inweight(soultype) + 2;
	let newconfig = Object.values(global.gameconfig.soulstone)
		.deepQuery('SOUL_TYPE', soultype)
		.deepQuery('STAR', config.STAR)
		.deepQueryOne('ATTR_TYPE', config.ATTR_TYPE)
	let obj = ctx.dao.soulstone.genNewStone('', newconfig.GSID);
	ctx.stone.gsid = obj.gsid;
	ctx.stone.attrs = obj.attrs;
	await ctx.role.save();
	await ctx.stone.save();
}