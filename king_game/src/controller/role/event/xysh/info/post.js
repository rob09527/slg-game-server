"use strict";

// 信息获取
module.exports = async function (ctx, next) {
    const {
        MARK: mark,
        TOTAL: total,
        WISH: wish,
    } = ctx.config;
    const { num = 0, wishIndex = -1, wishDone = false } = ctx.record;
    ctx.body = {
        mark,
        count: ctx.role.getProp(mark),
        total,
        num,
        wishDone,
        wishIndex,
        wish,
    }
}