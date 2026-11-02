'use strict'
const _ = require('lodash');
const businessCode = require('../../../util/businessCode');

/**
 * 获取排行榜
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */
module.exports = async (ctx, next) => {
    let {
        type,
    } = ctx.request.body;
    if (!['power', 'legion', 'general'].find(e => e == type)) {
        ctx.body = { ...businessCode.illegal_parameters, }
        return
    }
    let gameservs = Object.values(global.gameservs)
    const game = gameservs[_.random(0, gameservs.length - 1)];
    const rankinfo = await game.remote.vietnamRank(type);

    ctx.body = { ...businessCode.success, data: rankinfo }


}