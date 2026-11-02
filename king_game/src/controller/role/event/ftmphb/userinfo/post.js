"use strict"

const timekey = require("../../../../../util/timekey");

//信息查看

module.exports = async function (ctx, next) {
    const dateKey = timekey().ftmphb.date_today;
    await ctx.role.ftmphbinfo(ctx)
    let rewardmark = {}
    for (let x of global.gameconfig.ftmphb[3]) {
        if (ctx.role.ftmphb[`${dateKey}-price-${x.num}`]) {
            rewardmark[x.num] = true
        }
    }
    const count = ctx.role.getItems(30181).count;
    let info = {
        score: ctx.role.ftmphb[timekey().ftmphb.dailykey_db],
        totalscore: ctx.role.ftmphb[timekey().ftmphb.globalkey_db],
        count: count,
        rewardmark
    }
    ctx.body = info

}