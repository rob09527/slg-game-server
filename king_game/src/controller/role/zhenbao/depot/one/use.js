
'use strict'

module.exports = async (ctx, next) =>{
    let {
        zbid,
    } = ctx.request.body;
    let {zhenbao} = await ctx.depot.getZhenbaoOne({zbid, role: ctx.role});
    ctx.zhenbao = zhenbao;
    await next();
}