/**
 * 自动批量合成
 */
'use strict'
module.exports = exports = async (ctx, next) => {

    let equip = +ctx.request.body.equip;
    ctx.assert(!isNaN(equip), 'invalid equip');
    let doneCount = 0;
    while (global.gameconfig.equipcomp[equip + 1]) {
        equip = equip + 1;
        const cfg = global.gameconfig.equipcomp[equip];
        let canCompCount = Infinity;
        for (const cast of cfg) {
            const hasCount = ctx.role.getProp(cast.GSID);
            const c = Math.floor(hasCount / cast.COUNT);
            if (c < canCompCount){
                canCompCount = c;
            }
        }
        if (canCompCount > 0){
            const cast = ctx.updateEquip(equip, canCompCount);
            if(cast){
                doneCount += canCompCount
            }
        }
    }
    const items = [];
    const castitems = [];
    for (const GSID in ctx.role._change_items_) {
        const count = ctx.role._change_items_[GSID];
        if(count > 0){
            items.push({
                GSID: +GSID,
                COUNT: count
            })
        } else if(count < 0){
            castitems.push({
                GSID: +GSID,
                COUNT: -count
            })
        }

    }
    ctx.doneCount = doneCount;
    ctx.body = {
        items,
        castitems,
        doneCount
    }
    await next();
}
