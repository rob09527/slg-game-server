"use strict"

const moment = require("moment");

module.exports = exports = async function (ctx, next) {
    let curmoney = ctx.smzmxs.val;
    let reward = ctx.config.map((info, index)=>{
        return {
            title:info.NAME,
            reward:info.ITEMS,
            state: ctx.record[index] ? 2 :1,//1-未领取，2-已领取
            money: info.NUM,
            curmoney,
            index
        }
    })

    ctx.body = {
        reward,
        looplimit: 1,
        currentloop: 1,
    }
    let act = global.ACTIVITY[ctx.mode];
    const {params, ...out } = act.base(ctx.role);
    ctx.body.time = (out && out.etime) || Date.now();
}