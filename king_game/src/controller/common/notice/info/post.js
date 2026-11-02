
"use strict"

// 获取版本预告信息
module.exports = exports = async (ctx, next) =>{
    let notice = global.gameconfig.notice
    ctx.assert(notice, "config nexist")
    // TODO 参数待处理
    let { platform, bundle } = ctx.request.body
    let result = {}
    Object.keys(notice).forEach(each => result[each.toLowerCase()] = notice[each])
    ctx.body = result
}