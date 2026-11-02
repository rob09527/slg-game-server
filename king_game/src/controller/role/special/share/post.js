
'use strict'

module.exports = exports = async (ctx, next) =>{

	ctx.role.addItemsNoSave({ GSID: 90555, COUNT: 1 });
	await ctx.role.save();

	ctx.body = {
		num: ctx.role.getProp(90555)
	}
}