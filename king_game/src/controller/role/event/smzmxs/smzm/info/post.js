"use strict"

module.exports = exports = async function (ctx, next) {
    let {
        COST, POOL, BAODI5, XYWJ, SHOW
    } = ctx.config;
    let now = Date.now();
    ctx.body = {cost:[],pool:[]};
    ctx.body.general = SHOW.map(value=>{return {gsid:value}})
    for (let times in COST) {
        let {GSID, COUNT, SCORE, FREE_CD} = COST[times];
        let canfree = FREE_CD > 0;
        if (FREE_CD) {
            if (ctx.smzmxs.freetime) {
                canfree = Math.abs(now - ctx.smzmxs.freetime) >= FREE_CD * 3600 * 1000;
            }
        }
        ctx.body.cost.push({times, item:[{GSID,COUNT}], score:SCORE, canfree});
    }

    POOL.forEach(({GSID, COUNT})=>{
        if (GSID == XYWJ.GSID) return
        ctx.body.pool.push({GSID, COUNT});
    })
    
    ctx.body.xywj = {max:XYWJ.MAX, min:XYWJ.MIN, count:ctx.role.getProp(XYWJ.GFLMARK)};
    ctx.body.baodi = {max:BAODI5.MAX, count:ctx.role.getProp(BAODI5.GFLMARK)};
    let act = global.ACTIVITY[ctx.mode];
    const {params, ...out } = act.base(ctx.role);
    ctx.body.time = (out && out.etime) || Date.now();
}