
'use strict'
// 当前生效的卡
const mazeConfig = global.gameconfig.mazechapter;
module.exports = exports = async (ctx, next) => {
   // let lcards = await ctx.mazecards.fetchcards({ gateid: ctx.nowchapter.gateid, type: 'maze' });
    // 返回关卡信息
    let chapters = await ctx.dao.mazechapter.find({ rid: ctx.role.id }).sort({ floor: -1 });
    chapters = chapters[0];
    ctx.assert(chapters, 'invalid chapters');
    ctx.body = {
        lcards : [],
        levelfactor: ctx.levelfactor,
        row: chapters.row,
        pos: chapters.pos,
    }
}