"use strict"

const { isTime } = require("../../../../util/weektarget");
const toLower = item => item.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }));

// 七日目标 新创角7日内可做此活动
module.exports = async function(ctx, next) {
    ctx.assert(isTime(ctx.role), "not open");
    ctx.toLower = toLower;
    await next();
}