
'use strict'
// 指挥官设置公告
module.exports = exports = async (ctx, next) => {
    let { anno = '' } = ctx.request.body;
    // 移除所有空格
    anno = anno.replace(/\s+/g, '');
    ctx.assert(anno, 'need anno');
    ctx.assert(ctx.nationwarInfo.rid === ctx.role.i(), 'no allowed');
    ctx.nationwarInfo.anno = anno;
    ctx.nationwarInfo.update = Date.now();
    ctx.nationwarInfo.markModified('anno');
    await ctx.nationwarInfo.save();
    ctx.body = {};
}