
'use strict'
const _ = require('lodash');
module.exports = exports = async function (ctx, next) {
    let wangguesskeys = Object.keys(global.gameconfig.wangpvpguess);
    // 取出竞猜消耗数量
    const wangpvpguessConfig = global.gameconfig.wangpvpguess[_.sample(wangguesskeys)];//随意取出一个消耗数量
    let pay = wangpvpguessConfig.CASTITEMS[0].COUNT || 400000;
    ctx.wangguesspay = pay + wangpvpguessConfig.ADD_COUNT * ctx.role.level;
    await next();
}