/**
 * 装备兵书
 */
'use strict';

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");
const { hitHere } = require("../../../../../util/weektarget");

module.exports = exports = async (ctx, next) => {
    let {
        bookguid,
        pos = 0,
    } = ctx.request.body;
    ctx.assert([1, 2, 3, 4].includes(+pos), 'invalid pos');
    const book = await ctx.dao.book.findOne({ _id: bookguid });
    ctx.assert(book, 'invalid bookid');
    ctx.assert(!book.general, 'already worn');
    const bConfig = global.gameconfig.bookitems[book.gsid];
    ctx.assert(+pos === bConfig.POS, 'error book pos');

    pos = pos - 1; // 下标由0 开始

    const oldBookId = ctx.general.book[pos];
    if (oldBookId) {
        await ctx.dao.book.updateOne({ _id: oldBookId }, { $unset: { general: 1 } });
    }
    ctx.general.book[pos] = bookguid;
    ctx.general._book_[pos] = await book.base();
    book.general = ctx.general._id.toString();

    await ctx.general.save();
    await book.save();

    let arrStart = [];
    for (let i = 0; i < 4; i++) {
        let bookid = ctx.general.book[i];
        if (!bookid) { continue; }
        if (bookid == bookguid) {
            arrStart.push(bConfig.STAR);
            continue;
        }
        let fbook = await ctx.dao.book.findOne({ _id: bookid });
        if (!fbook) {
            break;
        }
        const bbook = global.gameconfig.bookitems[fbook.gsid];
        if (bbook) {
            arrStart.push(bbook.STAR);
        }
    }
    //装备一套X星及以上兵书
    if (arrStart.length == 4) {
        let minStart = Math.min(...arrStart);
        let curNumber = ctx.role.getProp(98784);

        if (minStart > curNumber) {
            hitHere(ctx.role, 98784, minStart - curNumber, true);
            await ctx.role.save();
        }
    }

    if (bConfig.GSID_AFTER_AWAKE) {
        // 为了触发推荐礼包
        ctx.role["BOOK_AWAKE"] = 1;
    }
    //秘境主线任务打点
    await secretTask(ctx, 99520, 1)
};
