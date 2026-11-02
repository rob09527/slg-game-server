
'use strict'

module.exports = exports = async function (ctx, next) {
    ctx.body = {monster:ctx.CACHE.monster, stage:ctx.CACHE.stage};
}