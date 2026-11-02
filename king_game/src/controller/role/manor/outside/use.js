
'use strict'

module.exports = exports = async (ctx, next) => {
    ctx.assert(ctx.manor,'invalid manor');
    await next();
}
