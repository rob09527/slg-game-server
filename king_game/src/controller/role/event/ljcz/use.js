'use strict'

// 累计充值
module.exports = async function(ctx, next) {
	let { actIndex = 0 } = ctx.request.body;
	if(actIndex == 0) actIndex = "";
	ctx.ljcz = `ljcz${actIndex}`;
	let key = '';
	if(actIndex >= 0 && actIndex <= 2){
		key = ctx.role.isXS(`xs_ljcz${actIndex}`) ?  `xs_ljcz${actIndex}`: ctx.ljcz;
		
	} else{
		key = ctx.ljcz;
	}
	ctx.assert(ctx.zhdpoint("ISZHD", key), "fn freeze")

	ctx.config = global.gameconfig.zhd_newhero[key.toUpperCase()] || global.gameconfig.zhd[key.toUpperCase()];
	ctx.assert(ctx.config, "invalid actIndex");
	await next();
}