
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = {};
	ctx.assert(ctx.eventtype <= 2, 'invalid type');
	switch(ctx.eventtype){
		case 1:
			ctx.role.addItemsNoSave(ctx.config);
			ctx.body = ctx.config;
			break;
		case 2:
			let {CAST, ADD} = ctx.config;
			ctx.role.castItemsNoSave(CAST);
			ctx.role.addItemsNoSave(ADD);
			ctx.body = ADD;
			break;
	}
	ctx.event.finish = Date.now();
	ctx.role.addItemsNoSave(90330);
	await ctx.role.save();
	await ctx.event.save();
}
