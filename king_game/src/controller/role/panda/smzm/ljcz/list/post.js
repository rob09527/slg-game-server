"use strict"

module.exports = exports = async function (ctx, next) {
    let reward = ctx.config.map((info, index)=>{
        return {
            reward:info.ITEMS,
            state: ctx.record[index] ? 2 :1,//1-未领取，2-已领取
            money: info.MONEY
        }
    })

    ctx.body = {
        reward,
        money: ctx.role.panda.smzm.ljczmoney,
        time: ctx.etime
    }
}