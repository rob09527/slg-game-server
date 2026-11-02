'use strict'

// 洗炼

module.exports = exports = async (ctx, next) => {
    let {from,to,guid} = ctx.request.body;
    let pet = await ctx.role.findPets(guid);
    ctx.assert(pet, 'err pet');
    let skill = pet.skills[from];
    ctx.assert(skill, 'err skill');
    ctx.assert(global.gameconfig.petskilllock[to], 'err lock');
    ctx.assert(ctx.pet.level >= to, 'err lock');
    ctx.pet.skills[to] = skill;
    let guids = []
    guids.push(guid);
    await global.dao.pet.deleteMany({_id: {$in: guids}});

    ctx.body = {
        pet: ctx.pet.base(),
        dels: guids
    }
}
