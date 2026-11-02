/**
 * 一键脱印记
 * 
 */
 'use strict';

 module.exports = exports = async (ctx, next) => {
  
     await ctx.dao.signet.updateMany({_id: {$in: ctx.general.signet}}, {$unset: {general: 1}});
     ctx.general.signet = [];
     ctx.general._signet_ = []; 
 
 };
 