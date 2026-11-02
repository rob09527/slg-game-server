
'use strict'

module.exports = exports = async (ctx, next) => {
    ctx.body = {};
    await next()
}