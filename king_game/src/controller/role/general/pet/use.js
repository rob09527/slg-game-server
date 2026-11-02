
'use strict'

const except_path = [
	"role/general/pet/set",
	"role/general/pet/recruit"
]

module.exports = exports = async (ctx, next) =>{
	if(!except_path.includes(ctx.path)) {
		try {
			ctx.pet = await ctx.role.findPets(ctx.general.pet.guid);
		}catch(e){
		}
		ctx.assert(ctx.pet, 'not exist');
		ctx.assert(!ctx.pet.expireAt || ctx.pet.expireAt > Date.now(), 'pet expire');
	}
	await next();
	if (!ctx.pet) return;
	ctx.general._pet_ = ctx.pet.base();
	await ctx.role.save();
	await ctx.pet.save();
}
