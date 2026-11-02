'use strict'

// 洗炼
const {hitHere} = require("../../../../../util/weektarget");

module.exports = exports = async (ctx, next) => {
    let config = global.gameconfig.horseitem[ctx.horse.gsid];
    let MAX = ctx.horse.property.length + ctx.horse.skill.length;
    let {lockprop,lockskill} = ctx.request.body;
    let num = 0;
    if (lockprop && lockprop.length){
        for (let i = 0; i < lockprop.length; i++){
            if (lockprop[i]) num++;
        }
    }
    if (lockskill && lockskill.length){
        for (let i = 0; i < lockskill.length; i++){
            if (lockskill[i]) num++;
        }
    }
    ctx.assert(num < MAX, 'limit study');
    const items = global.gameconfig.horsestudy[num]
    ctx.assert(items, 'limit study');

    ctx.horse.study++;
    // 随机属性
    let update1 = false;
    let length1 = config.PARR.length;
    for (let i = 0; i < length1; i++){
        if (lockprop && lockprop[i]) continue;
        let pool = global.gameconfig.horseprop[config.PARR[i]];
        if(pool){
            let filter = pool;
            if(ctx.horse.property[i]){
                let key = ctx.horse.property[i].key.toUpperCase();
                filter = pool.filter(d => d.KEY != key);
            }
            let attr = filter[ctx.random.inweight(filter.deepMap('W'))];
            ctx.horse.property[i] = {key: attr.KEY.toLowerCase(), val: attr.VAL};
            update1 = true;
        }
    }
    if(update1) ctx.horse.markModified('property');
     // 随机技能
    let {STUDY_NUM, STUDY_SKILL} = global.gameconfig.horsesetting;
    let study_skill = STUDY_NUM > 0 && ctx.horse.study >= STUDY_NUM ? 1 : 0;

    let update2 = false;
    let length2 = config.SARR.length;
    for (let i = 0; i < length2; i++){
        if (lockskill && lockskill[i]) continue;
        let idx = config.SARR[i];
        if(study_skill > 0) {
            idx = STUDY_SKILL[i];
            ctx.horse.study = 0;
        }
        let pool = global.gameconfig.horseskill[idx];
        if(pool){
            let filter = pool;
            if(ctx.horse.skill[i]){
                let key = ctx.horse.skill[i];
                filter = pool.filter(d => d.KEY != key);
            }
            let skill = filter[ctx.random.inweight(filter.deepMap('W'))];
            ctx.horse.skill[i] = skill.KEY;
            update2 = true;
        }
        study_skill--;
    }
    if(update2) ctx.horse.markModified('skill');

    const reason = {main: 'horse', sec: 'study'};
    ctx.role.castItemsNoSave(items, reason);

    ctx.body = {
        info: ctx.horse.base(),
    }

    ctx.role.missionInvoke('GENERAL_HORSE_RESET');
    //坐骑洗炼次数
    hitHere(ctx.role, 98900, 1, true);
}
