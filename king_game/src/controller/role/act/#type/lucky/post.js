'use strict';

// 抽奖类 奖励领取
module.exports = exports = async (ctx, next) => {
    const {time = 1} = ctx.request.body;
    ctx.assert(parseInt(time), 'time error'); // 次数不能小于1
    const res = await ctx.activity.lucky(ctx.role, parseInt(time));
    
    ctx.body = res;
};
