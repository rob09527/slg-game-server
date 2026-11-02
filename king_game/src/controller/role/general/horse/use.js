
'use strict'

const except_path = [
	"role/general/horse/seton",
	"role/general/horse/del",
]

module.exports = exports = async (ctx, next) =>{
	if(!except_path.includes(ctx.path)) {
		try {
			const {pos} = ctx.request.body
			ctx.horse = await ctx.role.findHorses(ctx.general.horse.guids[pos]);
		}catch(e){
		}
		ctx.assert(ctx.horse, 'not exist');
		ctx.assert(!ctx.horse.expireAt || ctx.horse.expireAt > Date.now(), 'horse expire');
	}
	await next();
	if (!ctx.horse) return;
	ctx.body.general = ctx.general.base();
	if(ctx.horse.pos >= 0) {
		ctx.general._horse_ = ctx.general._horse_ || [];
		ctx.general._horse_[ctx.horse.pos] = ctx.horse.base();
	}
	await ctx.horse.save();
}
