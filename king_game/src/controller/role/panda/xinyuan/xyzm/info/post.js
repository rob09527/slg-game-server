"use strict"

const moment = require("moment");

module.exports = exports = async function (ctx, next) {
    let {
        COST, GENERAL, POOL, BAODI5, XYWJ
    } = ctx.config;
    let cost = COST.map(({TIMES:times, ITEM:item, SCORE:score, FREE_CD:free_cd})=>{
        let canfree = free_cd > 0, freeTime = 0;
        if (free_cd) {
            if (ctx.role.panda.xyzm.freetime) {
                canfree = ctx.role.panda.xyzm.freetime + free_cd * 3600 * 1000 < new Date().getTime();
                if (canfree == false) {
                    freeTime = ctx.role.panda.xyzm.freetime + free_cd * 3600 * 1000;
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
        if (GSID == XYWJ.GSID) return
        pool.push({GSID, COUNT})
    })

	let start = moment(ctx.role.create).startOf('days').valueOf();
    let time = start + (global.gameconfig.panda.XINYZM[0].etime - 1) * (24 * 60 * 60 * 1000);
    
    ctx.body = {
        time,
        cost,
        pool,
        general: ctx.role.panda.xyzm.general,
        gens: Object.keys(GENERAL),
        baodi: {max:BAODI5.MAX, count:ctx.role.getProp(BAODI5.GFLMARK)},
        xywj: {max:XYWJ.MAX, min:XYWJ.MIN, count:ctx.role.getProp(XYWJ.GFLMARK)}
    };
}