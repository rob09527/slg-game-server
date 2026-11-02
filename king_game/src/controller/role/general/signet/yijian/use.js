/**
 * 装备印记
 */
 'use strict';

 module.exports = exports = async (ctx, next) => {
     ctx.assert(ctx.general.signet,'not settlet')
     ctx.general.signet =  ctx.general.signet ;
     ctx.general._signet_ =  ctx.general._signet_ ;
     await next();
     ctx.general.markModified('signet');
 };