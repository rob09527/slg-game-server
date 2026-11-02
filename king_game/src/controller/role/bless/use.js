'use strict'

module.exports = exports = async (ctx, next)=>{
    let config = global.gameconfig.bless;
    ctx.assert(config, 'invalid config');
    ctx.config = config;
    await next()
}