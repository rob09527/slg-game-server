/**
 * 脱掉兵书
 */
'use strict';

module.exports = exports = async (ctx, next) => {
    let {
        pos = 0,
    } = ctx.request.body;
    ctx.assert([1, 2, 3, 4].includes(pos), 'invalid pos');
    pos = pos - 1; // 下标由0 开始
    const oldBookId = ctx.general.book[pos];
    ctx.general.book[pos] = null;
    ctx.general._book_[pos] = null;
    if (oldBookId) {
        await ctx.dao.book.updateOne({_id: oldBookId}, {$unset: {general: 1}});
        await ctx.general.save();
    }

};
