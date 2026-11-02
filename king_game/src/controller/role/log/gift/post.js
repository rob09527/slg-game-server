"use strict";

// 前端礼包弹窗记录日志
module.exports = exports = async function(ctx, next) {
    // 前端传什么记录什么
    let { ext } = ctx.request.body;
    if(!Array.isArray(ext)) return     ctx.body =  ctx.body  || {};;
    ctx.khlog.giftlog("click", ctx.role, ...ext);
    ctx.body =  ctx.body  || {};
}
