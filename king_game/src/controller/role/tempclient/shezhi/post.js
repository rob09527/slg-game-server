/**
 * 客户端存临时数据
 */

 'use strict'

 module.exports = exports = async (ctx, next) =>{
    ctx.role.tempClient.generalUpPower = ctx.request.body.generalUpPower;
    ctx.role.tempClient.generalUpLeg = ctx.request.body.generalUpLeg;
    ctx.role.markModified("tempClient");
    await ctx.role.save();
    ctx.body = ctx.role.tempClient;
 }
 