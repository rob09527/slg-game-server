"use strict";

// 获取已经红包信息
module.exports = async function (ctx, next) {
    const now = Date.now();
    // 有效期内未领取的红包
    ctx.body = ctx.record.filter(({ end, reward }) => end > now && !reward);
}