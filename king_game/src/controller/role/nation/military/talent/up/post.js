'use strict';
const MAX_TALENT_COUNT = 25; // 单职业 最大 军衔技能点数
/*
* 军衔天赋升级
* */
module.exports = exports = async (ctx, next) => {

    const {id} = ctx.request.body;
    const talentConfig = global.gameconfig.military_talent.TALENT[id];
    ctx.assert(talentConfig, 'invalid talentId');
    const currentLevel = ctx.role.getMilitaryTalent(id);
    ctx.assert(currentLevel < talentConfig.MAXLV, 'max lv');
    const {talent} = ctx.role.getMilitary(talentConfig.OCC);
    const talents = Object.values(talent);
    // 计算总加成技能点
    const totalTalentCount = talents.length ? talents.reduce((a, b) => a + b) : 0;
    // 未达到解锁条件
    ctx.assert(totalTalentCount >= (talentConfig.ROW - 1) * 5, 'talent lock');
    ctx.assert(totalTalentCount < MAX_TALENT_COUNT, 'talent max');
    const castitems = [];
    if (talentConfig.COST){
        castitems.push({
            GSID: 38020,
            COUNT: talentConfig.COST
        })
    }
    if (castitems.length){
        ctx.role.castItemsNoSave(castitems);
    }
    ctx.role.upMilitary(id);


    ctx.body = {
        castitems,
        lv: ctx.role.getMilitaryTalent(id),

    }
};
