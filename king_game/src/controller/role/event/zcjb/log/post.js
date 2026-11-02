"use strict"

// 今日招财记录
module.exports = async function (ctx, next) {
    let log = ctx.record.log
    log.reverse() // 最近的排在最前面
    ctx.body = log
}