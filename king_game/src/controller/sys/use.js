
'use strict'

module.exports = exports = async (ctx, next) =>{
	// const ip = ctx.request.ip || "";
	// if(!ip.startsWith('10.20')){ // 稍稍做个外网访问验证
	// 	throw 'NOT FOUND';
	// }
	await next();
}
