
'use strict'
// 取巅峰赛录像数据
module.exports = exports = async (ctx, next) => {
    let {
        vedioid
    } = ctx.request.body;
    ctx.assert(vedioid, 'invalid vedioid');
    let params = {
        vedioid
    }
    let data = await ctx.commonsend('/topking/vedio/fetch', params);
    ctx.body = {
        vedio: data
    }
}
