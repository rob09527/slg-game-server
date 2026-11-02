
'use strict'

module.exports = exports = async (ctx, next) =>{
	try {
		ctx.pet = await ctx.role.findPets(ctx.request.body.guid);
	}catch(e){
	}
	ctx.assert(ctx.pet, 'not exist');
	ctx.assert(!ctx.general.expireAt || ctx.general.expireAt > Date.now(), 'general expire');
	await next();
}
