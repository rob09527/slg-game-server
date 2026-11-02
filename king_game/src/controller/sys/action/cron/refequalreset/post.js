
'use strict'

module.exports = exports = async function (ctx, next) {
	let $set = {
		resetnum: 0,
	}
	await ctx.dao.equalinfo.updateMany({}, {$set});
	ctx.body = {};
}