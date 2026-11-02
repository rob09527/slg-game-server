'use strict'
// 
module.exports = exports = async (ctx, next) => {
    // 取出关卡信息
    let chapter = await ctx.dao.mazechapter.find({ rid: ctx.role.id }).sort({ floor: -1 });
    ctx.nowchapter = chapter[0];
    // 判断上一个节点是否完成
    if (ctx.nowchapter.row != -1) {
        ctx.assert(ctx.nowchapter.judgenode(), 'node unfinish');
    }
    // 返回等级因子
    const challengefactor = global.gameconfig.challengefactor;
    let chapterConfig = global.gameconfig.chapter[ctx.role.maxmapid];
    ctx.assert(challengefactor, 'challengefactor config err');
    ctx.assert(chapterConfig, 'chapterConfig err')
    // 多返回一个等级战斗因子的数值
    let levelfactor = 0;
    if (chapterConfig) {
        let lfactor = ctx.role.level - chapterConfig.LIMIT;
        lfactor = Math.min(lfactor, challengefactor.LEVEL.length - 1);
        levelfactor = challengefactor.LEVEL[lfactor]
    }
    ctx.levelfactor = levelfactor;
    await next();
}
