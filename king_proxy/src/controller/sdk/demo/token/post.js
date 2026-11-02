'use strict'

/**
 * 登陆成功后返回 服务列表
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */
module.exports = async (ctx, next) => {
    let {
        sign,
        uid,
    } = ctx.request.body;
    ctx.assert(ctx.signfn(ctx.request.body) === sign, 'verify fail'); // 登陆验证
    // 通过返回服务列表
    let serverlist = await ctx.dao.gameserver.fetchPlayerServList(ctx.request.body);

    ctx.body = {
        uid,
        serverlist,
    }
}
