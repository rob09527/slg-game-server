
'use strict'



module.exports = exports = async (ctx, next) =>{
	let key =  'xs_zmqy';
	key = ctx.role.isXSConKey(key);
	let {
		GENERAL_EXCLUDE = [],
	} = global.gameconfig.zhd_xs[key.toUpperCase()];
	let generallist = global.gameconfig.recruit.filter(({ID: GSID}) =>{
		let config = global.gameconfig.general[GSID];
		if (!config) return false;
		// 排除指定武将
		if (GENERAL_EXCLUDE.includes(GSID)) return false;
		return config.STAR == 5;
	}).map(({ID: GSID}) =>{
		return GSID;
	});
	// 去重
	generallist = new Set(generallist);
	generallist = [...generallist];
	ctx.body = {
		generallist,
	}
}
