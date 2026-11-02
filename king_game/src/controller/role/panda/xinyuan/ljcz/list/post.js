"use strict"

const moment = require("moment");

module.exports = exports = async function (ctx, next) {
    let reward = ctx.config.map((info, index)=>{
        return {
            reward:info.ITEMS,
            state: ctx.record[index] ? 2 :1,//1-未领取，2-已领取
            money: info.MONEY
        }
    })

	let start = moment(ctx.role.create).startOf('days').valueOf();
    let time = start + (global.gameconfig.panda.XINYZM[0].etime - 1) * (24 * 60 * 60 * 1000);

    ctx.body = {
        reward,
        money: ctx.role.panda.xyzm.ljczmoney,
        time
    }
}