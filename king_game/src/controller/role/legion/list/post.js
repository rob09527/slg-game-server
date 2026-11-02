
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.body = {legionlist: []};
	let defaultMatch = {
		servid: {
			$in: ctx.role._gameserv.group_sid_list
		}
	};
	let legionlist = await ctx.dao.legion.find(defaultMatch).sort({power: -1});
	for (let l of legionlist) {
		ctx.body.legionlist.push(await l.base2(ctx.role._id));
	}
	if (Date.now() - ctx.role.lleft < 12 * 60 * 60 * 1000) ctx.body.lasttime = ctx.role.lleft;
}
