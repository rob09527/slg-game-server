/**
 * 一键穿兵书
 */
'use strict';
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");
const { hitHere } = require("../../../../../util/weektarget");

module.exports = exports = async (ctx, next) => {

    // const config = global.gameconfig.bookitems[gsid];

    const config = global.gameconfig.general[ctx.general.gsid];

    const occuObj = {
        [config.OCCU]: 1,
    };
    if (config.OCCU2) {
        occuObj[config.OCCU2] = 1;
    }

    const guid = ctx.general._id.toString();

    await ctx.dao.book.updateMany({
        _id: { $in: ctx.general.book },
    }, { $unset: { general: 1 } });
    // 默认等级降序
    const books = await ctx.dao.book.find({ rid: ctx.role.i(), general: { $exists: false } }, {}).sort({ level: -1 });
    if (books.length === 0) { // 没有可用兵书, 不返回报错
        return;
    }
    // 按照 星级和等级降序排序
    books.forEach(b => {
        const bConfig = global.gameconfig.bookitems[b.gsid];
        let is_occu = 0;
        for (const occ of bConfig.OCCU_RECOM) { // 找出推荐职业匹配的
            if (occuObj[occ]) {
                is_occu += 100;
            }
        }
        b._suit = bConfig.SUIT;
        b._pos = bConfig.POS - 1;
        b._weight = bConfig.STAR * 10000 + is_occu + b.level;  // 套装 推荐优于强化
        b._sign_weight = bConfig.STAR * 10000 + (is_occu / 100) + b.level * 10; // 不能组成套装 强化优于 推荐
    });

    books.sort((a, b) => b._weight - a._weight);
    const suitMap = {};

    for (const book of books) {
        suitMap[book._suit] = suitMap[book._suit] || {
            w: 0, // 权重
            pos: [],
            c: 0 // 套装数量
        };
        const m = suitMap[book._suit];
        if (m.pos[book._pos]) {
            continue;
        }
        m.pos[book._pos] = book;
        m.w += book._weight;
        m.c++;
        if (m.c !== 4) {
            continue;
        }
    }
    // 得到满足套装的推荐
    const suitItem = Object.values(suitMap).filter(a => a.c === 4).sort((a, b) => b.w - a.w)[0];
    let RECOM_BOOK;
    if (suitItem) {
        RECOM_BOOK = suitItem.pos;
    } else {
        // 没有满足套装的装备
        RECOM_BOOK = [];
        let c = 0;
        books.sort((a, b) => b._sign_weight - a._sign_weight);
        for (const b of books) {
            if (RECOM_BOOK[b._pos]) {
                continue;
            }
            RECOM_BOOK[b._pos] = b;
            c++;
            if (c === 4) { // 找齐推荐，打断循环
                break;
            }
        }
    }





    let arrStart = [];
    for (let i = 0; i < RECOM_BOOK.length; i++) {
        const b = RECOM_BOOK[i];
        if (b) {
            ctx.general.book[i] = b ? b._id.toString() : null;
            ctx.general._book_[i] = await RECOM_BOOK[i].base();
            const bbook = global.gameconfig.bookitems[b.gsid];
            arrStart.push(bbook.STAR);
        } else {
            ctx.general.book[i] = null;
            ctx.general._book_[i] = null;
        }
    }
    //装备一套X星及以上兵书
    if (arrStart.length == RECOM_BOOK.length) {
        let minStart = Math.min(...arrStart);
        let curNumber = ctx.role.getProp(98784);

        if (minStart > curNumber) {
            hitHere(ctx.role, 98784, minStart - curNumber, true);
            await ctx.role.save();
        }
    }
    await ctx.general.save();
    await ctx.dao.book.updateMany({ _id: { $in: RECOM_BOOK.filter(Boolean).map(b => b._id) } }, { $set: { general: guid } });
    //秘境主线任务打点
    await secretTask(ctx, 99520, 1)
};
