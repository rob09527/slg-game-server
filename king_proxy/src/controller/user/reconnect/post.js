'use strict'
/**
 * 重新链接,返回客户端新的游戏节点信息
 * @type {(function(*, *): Promise<void>)|*}
 */
module.exports = exports = async function (ctx, next) {
    let {
        token,
        uid,
        servid
    } = ctx.request.body;

    const tokenInfo = await ctx.dao.token.findOneAndUpdate({
        token,
        uid
    }, {
        $inc: {
            repeat: 1
        }
    });
    ctx.assert(tokenInfo, 'other ip login');
    ctx.assert(tokenInfo.update !== -1, 'gm kick'); // gm 踢下线操作
    ctx.assert(tokenInfo.repeat < 30, 'gm kick'); // 临时增加限制，避免频繁重连

    const servinfo = await ctx.dao.token.getGameInstance(servid);
    ctx.body = servinfo;
}
