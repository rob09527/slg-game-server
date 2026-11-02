'use strict'

module.exports = exports = async (ctx, next) => {

   ctx.assert(ctx.general.star >= global.gameconfig.others.SIGNET_STAR_LIMIT,'star limit')
   
    await next();
}