'use strict'

// 升级

module.exports = exports = async (ctx, next) => {

    let maxlevel = global.gameconfig.petitem[ctx.pet.gsid].MAXLEVEL;
	ctx.assert(ctx.pet.level + 1 <= maxlevel, 'max level');

    const reason = {main: 'pet', sec: 'level'};
    const items = [...(global.gameconfig.petlevel[ctx.pet.level - 1]||[]) ];
    ctx.role.castItemsNoSave(items, reason);
    ctx.pet.level++;
    // 技能
    const petskill = global.gameconfig.petskillitem[ctx.pet.quality-1];
    if (petskill && petskill[ctx.pet.level]) {
        let config = petskill[ctx.pet.level];
        let maps = [];
        let rates = [];
        for(k in config) {
            maps.push(k);
            rates.push(config[k])
        }
        const idx = ctx.random.inweight(rates);
        let skill = maps[idx];
        ctx.pet.skills[tx.pet.level] = skill;
    }

    ctx.body = {
        castitems: items,
        info: ctx.pet.base()
    }
}
