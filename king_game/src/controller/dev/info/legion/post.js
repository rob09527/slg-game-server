
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = {};
	const {id: _id} = ctx.request.body;
	const legion = await ctx.dao.legion.findOne({_id});
	if (legion) ctx.body.name = legion.name;
}