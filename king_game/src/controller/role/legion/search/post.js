
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {name} = ctx.request.body;
	let defaultMatch = {
		servid: {
			$in: ctx.role._gameserv.group_sid_list
		}
	};

	let legion = await ctx.dao.legion.findOne({name, ...defaultMatch });
	ctx.assert(legion, 'legion nexist');
	ctx.body = await legion.base2(ctx.role._id);
}
