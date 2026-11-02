
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 查找所在的关卡
	let cond = {
		rid: ctx.role._id,
		// 尚未结束(没有结束标记)
		finish: {$exists: 0},
	}
	// 倒序
	ctx.chapter = await ctx.dao.c_dgchapter.find(cond);
	// 检查是否只有一张正在通关的关卡
	ctx.assert(ctx.chapter.length == 1, 'chapter dataerr');
	// 指定一个关卡
	ctx.chapter = ctx.chapter[0];
	await next();
}