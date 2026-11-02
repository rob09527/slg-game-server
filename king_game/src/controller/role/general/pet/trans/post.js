'use strict'

// 传承

module.exports = exports = async (ctx, next) => {
    let {skill,level,guid} = ctx.request.body;
    let pet = await ctx.role.findPets(guid);
    ctx.assert(pet, 'err pet');
    if(skill){
        let tmp = ctx.pet.skills;
        ctx.pet.skills = pet.skills;
        pet.skills = tmp;
    }
    if(level){
        pet.level = ctx.pet.level;
        pet.raise = ctx.pet.raise;

        ctx.pet.level = 1;
        ctx.pet.raise = 0;
    }
    await ctx.pet.save(); // 保存当前

    // 交换激活
    ctx.general.pet.guid == pet.guid
    ctx.pet = pet;

    ctx.body = {
        pet: ctx.pet.base(),
    }
}
