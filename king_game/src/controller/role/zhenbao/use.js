
'use strict'

module.exports = async (ctx, next) => {
    // 记录基金开始时间
    if (!ctx.role.zhenbao_fund_start) {
        await ctx.role.updateOne({ $set: { zhenbao_fund_start: Date.now() } });
        ctx.role.zhenbao_fund_start = Date.now();
    }
    if (!ctx.role.zhenbao_fund_start1) {
        ctx.role.zhenbao_fund_start1 = Date.now()
        await ctx.role.updateOne({ $set: { zhenbao_fund_start1: Date.now() } });
    }
    await next();
}