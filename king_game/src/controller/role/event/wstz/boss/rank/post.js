"use strict"

// 单次最高伤害排行榜
module.exports = async function (ctx, next) {
    ctx.body = await ctx.commonsend("/activityinfo/wstz/rank", {
        servid: ctx.role.servid,
        rid: ctx.role.i(),
        bossid: ctx.bossid,
    })
}