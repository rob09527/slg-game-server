'use strict';

/*
* 军衔天赋技能解锁
* */
module.exports = exports = async (ctx, next) => {

    const {id} = ctx.request.body;
    const skillConfig = global.gameconfig.military_talent.TALENT_SKILL[id];
    ctx.assert(skillConfig, 'invalid skill Id');

    const military = ctx.role.getMilitary(skillConfig.OCC);

    const talents = Object.values(military.talent);
    // 计算总加成技能点
    const totalTalentCount = talents.length ? talents.reduce((a, b) => a + b) : 0;
    // 未达到解锁条件
    ctx.assert(totalTalentCount >= skillConfig.COST, 'skill lock');
    ctx.assert(!military.skill[id], 'already unlock'); // 已经解锁
    military.skill[id] = 1;

    ctx.role.military = ctx.role.military || {};
    ctx.role.military[skillConfig.OCC] = military;
    ctx.role.markModified('military');

    ctx.body = {
        military
    };

};
