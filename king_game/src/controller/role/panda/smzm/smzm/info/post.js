"use strict"

module.exports = exports = async function (ctx, next) {
    let {
        COST, POOL, BAODI5, SMWJ, SHOWGENERAL
    } = ctx.config;
    let cost = COST.map(({TIMES:times, ITEM:item, SCORE:score, FREE_CD:free_cd})=>{
        let canfree = free_cd > 0, freeTime = 0;
        if (free_cd) {
            if (ctx.role.panda.smzm.freetime) {
                canfree = ctx.role.panda.smzm.freetime + free_cd * 3600 * 1000 < new Date().getTime();
                if (canfree == false) {
                    freeTime = ctx.role.panda.smzm.freetime + free_cd * 3600 * 1000;
                }
            }
        }
        return {
            times,
            item,
            score,
            canfree,
            freeTime
        }
    });
    let pool = [];
    POOL.forEach(({GSID, COUNT}, index)=>{
        if (GSID == SMWJ.GSID) return
        pool.push({GSID, COUNT})
    })
    
    ctx.body = {
        time: ctx.etime,
        cost,
        pool,
        general: SHOWGENERAL,
        baodi: {max:BAODI5.MAX, count:ctx.role.getProp(BAODI5.GFLMARK)},
        xywj: {max:SMWJ.MAX, min:SMWJ.MIN, count:ctx.role.getProp(SMWJ.GFLMARK)}
    };
}