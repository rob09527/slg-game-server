
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.preview = await ctx.dao.c_excuattr.findOne({general: ctx.general._id});
	await next();
	ctx.body = {
		level: ctx.general.exclusive.level,
		property: ctx.preview.property,
		skill: ctx.preview.skill,
	}
}