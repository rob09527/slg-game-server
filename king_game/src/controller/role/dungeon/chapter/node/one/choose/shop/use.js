
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 检查事件类型
	let {
		id,
		type,
	} = ctx.pos;
	if (type == 5) ({id, type} = ctx.pos.event);
	ctx.assert(type == 6, 'not shoptype');
	await next();
}