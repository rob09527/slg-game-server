/**
 * 一键脱兵书
 */
'use strict';

module.exports = exports = async (ctx, next) => {

    // const config = global.gameconfig.bookitems[gsid];

    await ctx.dao.book.updateMany({_id: {$in: ctx.general.book}}, {$unset: {general: 1}});
    ctx.general.book = [];

    ctx.general._book_ = []; // 清空book_info
    await ctx.general.save();

};
