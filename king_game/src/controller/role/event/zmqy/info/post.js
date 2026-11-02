
'use strict'



// 默认数据结构
const DEFAULT_DATA = {
	gsidlist: [],
	val: 0,
}

module.exports = exports = async function (ctx, next) {
	// const {
	// 	GNUM_MAX,
	// 	ZF_VAL_MAX,
	// 	CHANCE_SCALE_1000,
	// } = global.gameconfig.zhd.ZMQY;
	const {
		GNUM_MAX,
		ZF_VAL_MAX,
		CHANCE_SCALE_1000,
	} = ctx.config;
	// 武将信息格式转换
	let savegenerals = ctx.zmqy.gsidlist.map(({gsid, got}) =>{
		return {
			gsid,
			isget: got? 1: 0,
		};
	})
	let cur = Math.min(ctx.zmqy.val, ZF_VAL_MAX);
	let zf = {
		cur,
		max: ZF_VAL_MAX,
		prob: CHANCE_SCALE_1000 * cur,
	}
	ctx.body = {
		zf,
		savegenerals,
		gnummax: GNUM_MAX,
	};
}
