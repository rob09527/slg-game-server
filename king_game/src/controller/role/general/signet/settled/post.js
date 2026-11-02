'use strict'
/**
 * 武将入驻
 */
module.exports = exports = async (ctx, next) => {
   
    ctx.general.signet = [];
    ctx.general.markModified('signet');
    
    await next();
}