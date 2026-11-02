
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {steps = []} = ctx.request.body;
	let doc = await ctx.dao.guildstep.find({rid: ctx.role._id, step: {$in: steps}}).sort({step: -1});
	// ctx.assert(doc.length > 0, 'no step');
	if(doc.length == 0){
		ctx.body = {error: 'no step'};
		return;
	}
	ctx.body = doc.map (({step, create: time, mark = {}}) => {
		return {step, time, mark};
	})
}
