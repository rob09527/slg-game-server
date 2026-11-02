'use strict'

// 激活

module.exports = exports = async (ctx, next) => {
    let {guid} = ctx.request.body;
    ctx.pet = await ctx.role.findPets(guid);
    ctx.assert(ctx.pet, 'err pet');
    ctx.general.pet.guid = ctx.pet.guid;
    ctx.general.markModified('pet.guid');

    ctx.body = {
        pet: ctx.pet.base(),
    }
}
