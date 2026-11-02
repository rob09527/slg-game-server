
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 检查事件是否被选择
	ctx.assert(ctx.pos.choose, 'not choose');
	await next();
}