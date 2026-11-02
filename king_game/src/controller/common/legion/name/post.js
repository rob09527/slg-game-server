
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		legionid
	} = ctx.request.body;
	let legion = await ctx.dao.legion.findOne({_id: legionid});
	ctx.body = {};
	if (legion) ctx.body.name = legion.name;
}