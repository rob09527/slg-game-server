'use strict'
const _ = require('lodash');
module.exports = exports = async function (ctx, next) {
    let {
        action,
    } = ctx.request.body;
    if (!global.config.ITEMTEST) {
        ctx.request.body = '特殊接口,请配置'
        return
    }
    let gameservs = Object.values(global.gameservs)
    const game = gameservs[_.random(0, gameservs.length - 1)];
    const result = await game.remote.dfscs(action);
    ctx.body = '执行完毕'
}