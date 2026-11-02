
'use strict'

const {hitHere} = require("../../../../../util/weektarget");
module.exports = exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    ctx.assert(ctx.tian.refersh[index] > 0,'can not refersh')
    let val = ctx.tian.val;
    let level = ctx.role.level;
    let _pool = [];
    for (let GSID in ctx.config.QUALITY) {
        let value = ctx.config.QUALITY[GSID];
        if (val >= ctx.config.COST.MAXLUCK) {
            if (value.RARITY < 2) continue;
        }
        if (level >= value.MIN_LV && level <= value.MAX_LV && val >= value.MIN_LUCK && val <= value.MAX_LUCK) {
            _pool.push({GSID,CHANCE:value.CHANCE});
        }
    }
    let rates = _pool.deepMap('CHANCE');
    let general = _pool[ctx.random.inweight(rates)];
    ctx.assert(general, 'config err');
    if (val >= ctx.config.COST.MAXLUCK) {
        ctx.tian.val = 0;
    }
    ctx.tian.val += ctx.config.COST.ADDLUCK;
    ctx.body = {id:general.GSID,val:ctx.tian.val};
    ctx.tian.refersh[index]--;
    ctx.tian.temprefersh[index] = general.GSID;
    ctx.role.markModified('destiny');
    ctx.role.castItemsNoSave({GSID:38005, COUNT:ctx.config.COST.COST});
    //天命岩洗炼X次
    hitHere(ctx.role, 98789, 1, true);
    let RARITY = ctx.config.QUALITY[general.GSID];
    if (RARITY.RARITY == 2) {//天命岩洗出X条红色属性
        hitHere(ctx.role, 98788, 1, true);
    }
    else if (RARITY.RARITY == 1) {//天命岩洗出X条橙色属性
        hitHere(ctx.role, 98787, 1, true);
    }

    ctx.role.missionInvoke('DESTINY_REFERSH');
}