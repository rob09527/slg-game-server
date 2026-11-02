/**
 * 客户端存临时数据
 */

 'use strict'
 const moment = require("moment");

 module.exports = exports = async (ctx, next) =>{
   if (ctx.role.tempClient.clear == 1 && moment(ctx.role.create).startOf('days').valueOf() + 2 * 24 * 3600 * 1000 >= Date.now()) {
       ctx.role.tempClient = {generalUpPower:1, generalUpLeg:1, clear:0};
       ctx.role.markModified("tempClient");
       await ctx.role.save();
   }
    ctx.body = ctx.role.tempClient;
 }
 