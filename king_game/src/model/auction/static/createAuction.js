'use strict';
const random = require('../../../util/random/index');
const moment = require('moment');
/**
 *  创建拍品
 *  @param auctioneer {string} 拍卖方 （ north 北伐， legion_***** 军团
 *  @param option {{pool: number, type: string, bounceList: string[], MIN: number, MAX: number ,COUNT: number, groupid: number}}
 *               选项因子 pool type 传递其一即可，军团拍卖通过 type来决定池子，北伐直接传递池子pool, MIX MAX 和 COUNT 只需传递其1
 *
 */
module.exports = exports = async function (auctioneer, option) {
    const [tp, id] = auctioneer.split('_'); // 根据规则，取出拍卖类型 LEGION 则为军团拍卖 ALL 为全服拍卖
    const TYPE = tp.toUpperCase();
    const auctionConfig = global.gameconfig.auction[TYPE]; // 取出配置
    assert(auctionConfig, 'miss ' + TYPE + ' auction config');

    // 开拍时间为当天的这个时间
    let start;

    // 自定义开始时间
    if (option.start) {
        start = option.start;
    } else {
        start = new Date(moment().format('YYYY-MM-DD ') + auctionConfig.START).getTime();
        if (start < Date.now()) { // 如果这个时间小于今天，则次日
            start += (24 * 3600 * 1000);
        }
    }


    const auctionPools = global.gameconfig.auction.POOL; // 拍品池子
    const poolOptions = option.pool ? option.pool : auctionConfig.POOL[option.type]; // 根据因子取出产出配置
    let legionLevel = null; // null 表示忽略军团等级
    if (TYPE === 'LEGION') {
        // 军团等级会影响拍品
        const l = await global.dao.legion.findOne({_id: id});
        if (l) {
            legionLevel = l.level;
            if (!option.bounceList) {
                option.bounceList = l._members.map(_ => _.rid);
            }
        } else {
            legionLevel = 0;
        }
    }
    const out = [];
    for (const opt of poolOptions) {

        // 取出对应的池子商品
        const pool = auctionPools.filter(p => p.POOL === opt.POOL && (legionLevel === null || p.LEGION_MIN === null || (p.LEGION_MIN <= legionLevel && legionLevel <= p.LEGION_MAX)));
        if (pool.length === 0) {
            continue;
        }
        const count = opt.COUNT || random.between(opt.MIN, opt.MAX);
        if (!count) {
            continue;
        }
        const c = random.fpool(pool, count, 'WEIGHT', true);
        // console.log('TYPE', opt.POOL, c.map(_ => _.GSID0).join(' '))
        out.push(...c);
    }


    let expireAt = start + auctionConfig.KEEP_TIME * 1000;

    if (option.etime) {
        expireAt = option.etime;
    }
    const now = Date.now();
    const auctionItems = out.map(item => {
        const count = random.between(item.COUNT_MIN0, item.COUNT_MAX0);
        const firstAuction = Math.round(item.AUCTION_PRICE * count);
        return {
            auctioneer: auctioneer,
            item: {
                gsid: item.GSID0,
                count: count,
            },
            groupid: option.groupid,
            price: Math.round(item.PRICE * count),
            basePrice: Math.round(item.BASE_PRICE * count),
            firstAuction: firstAuction,
            auctionPrice: firstAuction,
            stepPrice: Math.round(item.STEP_PRICE * count),
            history: [],
            bounceList: option.bounceList, // 分红列表
            bounceType: option.type || '0', //
            create: now,
            start,
            expireAt,
        };
    });

    // 删除已经过期了14天的所有拍品
    await this.deleteMany({auctioneer, expireAt: {$lt: now - 14 * 3600 * 1000 * 24}});
    this.refreshSchedule();
    const o = await this.create(auctionItems);
    console.log('CREATE AUCTION FINISH', auctioneer);
    // 激活拍卖行礼包
    // await global.dao.c_auctionpack.active(start, expireAt, auctioneer)
    return o;
};
