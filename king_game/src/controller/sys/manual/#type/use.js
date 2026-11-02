
'use strict'

module.exports = exports = async (ctx, next) =>{
	const condition = {[ctx.params.type]: ctx.request.body[ctx.params.type]}
	let servid = ctx.request.body.servid || ctx.request.body.sid;
	// 用户查询加上 servid 条件
	if ( ctx.params.type !== '_id' && servid) condition.servid = servid;
	ctx.role = await ctx.dao.role.findOne(condition);
	ctx.assert(ctx.role, 'role err');
	ctx.role._path_ = ctx.path;
	await next();
}
