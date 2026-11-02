'use strict'

const { hitHere } = require("../../../../../util/weektarget");
// 升品

module.exports = exports = async (ctx, next) => {

    let {MAXLEVEL, NGSID, QUALITY} = global.gameconfig.horseitem[ctx.horse.gsid];
    ctx.assert(NGSID, 'max quality');
	ctx.assert(ctx.horse.level >= MAXLEVEL, 'limit level');
    
    const config = global.gameconfig.horseitem[NGSID];
    ctx.assert(config, 'limit gsid');

    const items = global.gameconfig.horseawake[QUALITY-1];
    ctx.assert(items, 'limit quality');

    const reason = {main: 'horse', sec: 'awake'};
    ctx.role.castItemsNoSave(items, reason);

    ctx.role.notifyGeneralCost({
        type: 'awake',
        gsid: ctx.horse.gsid,
    })
    ctx.role.addItemsNoSave({gsid: NGSID, formark: 1});

    ctx.horse.gsid = NGSID;
    ctx.horse.level = 1;
    // ctx.horse.study = 0; 

    // 随机属性
    let update1 = false;
    for (let i = 0; i < config.PARR.length; i++){
        if(ctx.horse.property[i]){
            // 属性不变
        }else{
            let pool = global.gameconfig.horseprop[config.PARR[i]];
            if(pool){
                let attr = pool[ctx.random.inweight(pool.deepMap('W'))];
                ctx.horse.property[i] = {key: attr.KEY.toLowerCase(), val: attr.VAL};
                update1 = true;
            }
        }
	}
    if(update1) ctx.horse.markModified('property');
    // 随机技能
    let update2 = false;
    for (let i = 0; i < config.SARR.length; i++){
        if(ctx.horse.skill[i]){
            // 技能升级
        }else{
            let pool = global.gameconfig.horseskill[config.SARR[i]];
            if(pool){
                let skill = pool[ctx.random.inweight(pool.deepMap('W'))];
                ctx.horse.skill[i] = skill.KEY;
                update2 = true;
            }
        }
    }
    if(update2) ctx.horse.markModified('skill');

	// 新七日目标-坐骑X品质个数
	if(config.QUALITY == 2){
		hitHere(ctx.role, 98720, 1, true);
	}
	else if(config.QUALITY == 3){
		hitHere(ctx.role, 98740, 1, true);
	}
	else if(config.QUALITY == 4){
		hitHere(ctx.role, 98760, 1, true);
	}

    // 为了触发推荐礼包，坐骑升级
	ctx.role[`HORSE_UP_${config.QUALITY}`] = config.QUALITY;

    ctx.body = {
        castitems: items,
        info: ctx.horse.base()
    }
}
