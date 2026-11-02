
'use strict'

module.exports = exports = async function (ctx, next) {
	let list = await ctx.dao.role.find({}, {'hide.38001': 1, pvpscore: 1}).sort({pvpscore: -1}).limit(100);
	let total = list.length;
	let level = list.reduce((cur, nxt) => {
		cur += nxt.level
		return cur;
	}, 0);
	level = Math.trunc(level / total);
	ctx.body = {level};
}