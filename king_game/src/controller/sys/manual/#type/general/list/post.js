
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		guids,
	} = ctx.request.body;
  	const generalMap = await ctx.role.findGenerals(guids);
	ctx.body = Object.values(generalMap).map(g => g.base());
}
