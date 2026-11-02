'use strict';

/*
* 军衔天赋重制
* */
module.exports = exports = async (ctx, next) => {

    const {occ} = ctx.request.body;


    const military = ctx.role.getMilitary(occ);
    const talents = Object.values(military.talent);
    // 计算总加成技能点
    const totalTalentCount = talents.length ? talents.reduce((a, b) => a + b) : 0;

    ctx.assert(totalTalentCount, 'empty talent'); // 未分配技能点不需要重制

    // 获取重制配置
    const mconfig = global.gameconfig.military_talent.RESET;
    const castitems = [];
    if (mconfig.CAST){
        castitems.push(...mconfig.CAST)
    }
    if (castitems.length){
        ctx.role.castItemsNoSave(castitems);
    }
    const items = [{
        GSID: 38020,
        COUNT: totalTalentCount
    }];
    ctx.role.addItemsNoSave(items);

    ctx.role.military =  ctx.role.military || {};
    ctx.role.military[occ] = {
        talent: {},
        skill: {}
    };
    ctx.role.markModified('military');

    ctx.body = {
        castitems,
        items,
        military:      ctx.role.military[occ],
    }
};
