
'use strict'
// const { start, day } = require("../../../../util/weektarget");
/**
 * @deprecated 可以废弃了，部分数据的获取，可以主动推给客户端
 *
 */
module.exports = exports = async (ctx, next) =>{

	let {arr} = ctx.request.body;
	arr = arr || [];
	arr = Array.isArray(arr)? arr : [arr];

	ctx.body = await ctx.role.base();

	let tmp = {};
	for (const key of arr) {
		tmp[key] = ctx.body[key];
	}
	ctx.body = tmp;
}
