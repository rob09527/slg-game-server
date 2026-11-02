
'use strict'


module.exports = exports = async (ctx, next) =>{
	let {
		guids = [],
		rid,
		sid
	} = ctx.request.body;

	ctx.body = {};
	ctx.role = await ctx.dao.role.findOne({_id: rid});
	ctx.assert(ctx.role, 'role err');
	const generalMap = await ctx.role.findGenerals(guids);
	ctx.body.generals = Object.values(generalMap).map(g => g.base());

}
