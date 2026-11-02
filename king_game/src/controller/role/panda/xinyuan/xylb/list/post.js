"use strict"

const moment = require("moment");

module.exports = exports = async function (ctx, next) {
    let reward = ctx.config.map((info, index)=>{
        let bought = ctx.record[index] || 0;
        return {
            id:info.ID,
            price:info.PRICE,
            exp:info.EXP,
            limit:info.LIMIT,
            spec:info.SPEC,
            items:info.ITEMS,
            buytimes: info.LIMIT - bought
        }
    })

	let start = moment(ctx.role.create).startOf('days').valueOf();
    let time = start + (global.gameconfig.panda.XINYZM[0].etime - 1) * (24 * 60 * 60 * 1000);
    
    ctx.body = {
        time,
        reward,
    }
}