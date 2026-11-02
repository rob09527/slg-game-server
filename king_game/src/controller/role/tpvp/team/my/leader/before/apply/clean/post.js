
'use strict'

module.exports = exports = async function (ctx, next) {
	const ret = await ctx.dao.apply.remove({type: 'teampvp', to: ctx.team._id});
	ctx.body = {n: ret.deletedCount};
}