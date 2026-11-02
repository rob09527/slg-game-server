"use strict"

const moment = require('moment')
// 活动福袋（圣诞福袋）
module.exports = async function(ctx, next) {
    
    if(!ctx.role.fudai[ctx.hdType]) {
        ctx.role.fudai[ctx.hdType] = { unlocktime: 0, buyindex: 0, buycount: [], rewardtime: [] };
        ctx.role.markModified("fudai");
    }

    ctx.hdData = ctx.role.fudai[ctx.hdType];
    await next();

    await ctx.role.save();
}