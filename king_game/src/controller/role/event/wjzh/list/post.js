
'use strict'

module.exports = exports = async function (ctx, next) {
    let { WJZH: config } = global.gameconfig.zhd;
    ctx.body = config.map(function ({ LIMIT, CAST: need, ITEMS: reward }, index) {
        return {
            limit: LIMIT,
            need,
            reward,
            buytime: LIMIT - (ctx.role.wjzh[index] || 0),
        }
    })
}