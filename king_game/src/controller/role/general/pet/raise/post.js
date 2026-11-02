'use strict'

// 培养

module.exports = exports = async (ctx, next) => {

    let pets = await ctx.role.findPets(ctx.request.body.guids);
    ctx.assert(pets.length > 0, 'err pet');
    let maxraise = global.gameconfig.petitem[ctx.pet.gsid].MAXRAISE;
    ctx.assert(ctx.pet.raise + pets.length <= maxraise, 'max raise');

    let guids = []
    for(let i = 0; i < pets.length; i++){
        ctx.pet.raise++;
        guids.push(pets[i].guid);
    }
    await global.dao.pet.deleteMany({_id: {$in: guids}});

    ctx.body = {
        pet: ctx.pet.base(),
        dels: guids
    }
}
