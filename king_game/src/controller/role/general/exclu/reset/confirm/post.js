
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.preview, 'preview nexist');
	let {confirm = 0} = ctx.request.body;

	if (parseInt(confirm)) {
		ctx.general.exclusive.property = ctx.preview.property;
		ctx.general.exclusive.skill = ctx.preview.skill;
		ctx.general.markModified('exclusive.skill');
		ctx.general.markModified('exclusive.property');
	}
	
	await ctx.preview.remove();
}