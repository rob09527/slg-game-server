
'use strict'



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
	// 检查是否已经设置
	ctx.assert(ctx.zmqy.gsidlist.length == 0, 'already set');
	let {
		gsidlist = []
	} = ctx.request.body;
	// 去重
	gsidlist = new Set(gsidlist);
	gsidlist = [...gsidlist];
	// 判断长度
	ctx.assert(gsidlist.length == GNUM_MAX, 'invalid gsidlen');
	gsidlist = gsidlist.map(gsid =>{
		return {gsid};
	})
	ctx.zmqy.gsidlist = gsidlist;
	ctx.role.zmqy = ctx.zmqy;
	ctx.role.markModified('zmqy');
	await ctx.role.save();
	ctx.body = {};
	// 周活动日志-称心如意
	ctx.zhdprint("zmqy1", gsidlist.map(({ gsid }) => gsid).join("-"))
}
