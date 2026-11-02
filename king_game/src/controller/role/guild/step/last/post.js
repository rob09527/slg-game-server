
'use strict'

module.exports = exports = async (ctx, next) =>{
	let doc = await ctx.dao.guildstep.findOne({rid: ctx.role._id}).sort({step: -1});
	ctx.assert(doc, 'no step');
	let {step, create: time, mark = {}} = doc;
	ctx.body = {step, time, mark};
}