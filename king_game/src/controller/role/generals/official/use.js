
'use strict'

module.exports = exports = async (ctx, next) =>{
    const config = gameconfig.generalofficial;
    const gOfficial = ctx.role.general_official || {};
    gOfficial.official = gOfficial.official || {};
    gOfficial.retinue =   gOfficial.retinue || {};
    ctx.gOfficial = gOfficial;
    ctx.config = config;
    await next();
}
