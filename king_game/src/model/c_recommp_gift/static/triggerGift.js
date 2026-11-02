'use strict';
const assert = require('assert');
const is_batch = require('../../../util/is_batch');

/**
 * 触发一个礼包
 * @param role {object}
 * @param giftType {string} 礼包类型，如：LV20
 * @author awko
 */
module.exports = exports = async function (role, giftType) {
    const giftList = global.gameconfig.sppackrecommend.SPPACK[giftType];
    if (!giftList || !giftList.length) {
        return;
    }
    const IS_BATCH = is_batch(giftType); // BATCH开头的推荐礼包为多档次同时触发的推荐礼包类型

    const MODEL = IS_BATCH ? global.dao.c_recommp_gift_batch : this;

    const TRIGGER_LIMIT = giftList[0].TRIGGER_LIMIT === -1 ? Infinity : (giftList[0].TRIGGER_LIMIT || 1);
    const expireHour =  giftList[0].HOUR ? giftList[0].HOUR: 2;
    const triggerTimes = await MODEL.countDocuments({type: giftType, rid: role.i()}); // 获得触发次数

    if (triggerTimes >= TRIGGER_LIMIT) { // 触发次数已经达到
        return;
    }

    const existsOne = await MODEL.findOne({type: giftType, rid: role.i(), expireAt: {$gt: Date.now()}, isBuy: 0}, {isBuy: 1}); // 获得触发次数
    if (existsOne) {
        // 未失效的同类型推荐礼包还未被购买 不触发
        return;
    }

    if (giftList[0].ONE_DAY_LIMIT && giftList[0].ONE_DAY_LIMIT > 0) { // 一日购买限制
        const nowDay = new Date();
        nowDay.setHours(0, 0, 0, 0);
        // const buyTimes = await MODEL.countDocuments({type: giftType, rid: role.i(), buyTime: {$gte: nowDay.getTime()}});
        // if (buyTimes >= giftList[0].ONE_DAY_LIMIT) { // 今日购买已经达到了上线
        //     return;
        // }
        // 2020-11-07 modify by jesse, ONE_DAY_LIMIT 改成触发次数
        const createTimes = await MODEL.countDocuments({type: giftType, rid: role.i(), create: {$gte: nowDay.getTime()}});
        if (createTimes >= giftList[0].ONE_DAY_LIMIT) { // 今日触发次数达到了上线
            return;
        }
    }

    // 计算拓展资源配置
    const calExpand = (currentGift)=> {
        const calitems = [];
        if (currentGift.EXPAND) { // 如果有配置拓展资源
            const coin = role.getItems(38006).count; // 铜钱
            const gexp = role.getItems(30001).count; // 武将经验
            const up = role.getItems(30015).count; // 进阶石
            const ar = [{v: coin / 3000, id: 0}, {v: gexp / 1500, id: 1}, {v: up, id: 2}].sort((a, b) => a.v - b.v);
            if ((ar[2].v - ar[0].v) / ar[2].v > 0.25) { // 差值比例大于 25% 礼包拓展奖励 发放最低的资源
                calitems.push(currentGift.EXPAND[ar[0].id]);
            } else { // 所以资源差距不大，拓展资源发放4号资源
                calitems.push(currentGift.EXPAND[3]);
            }
        }
        return calitems;
    }

    const now = Date.now();
    const expireTime = 1000 * 3600 * expireHour; // 失效时间
    const expireAt = now + expireTime;

    console.log(giftType,IS_BATCH)
    if (IS_BATCH) { // 多档次同时触发的推荐礼包类型，不执行选档逻辑
        const sppack = giftList.map(g => {
            const items = [...g.ITEMS, ...calExpand(g)];
            return {
                buyTime: 0,
                count: g.SELL_COUNT || 1, // SELL_COUNT为可被购买次数
                price: g.PRICE,
                rewards: items,
                exp: g.EXP
            }
        });

        return MODEL.create({
            rid: role._id,
            vip: role.vip,
            type: giftType,
            create: now,
            expireAt: expireAt,
            sppack
        });
    }
    const vipLevel = role.vip;
    // 根据vip 等级找出档次
    const grade = global.gameconfig.sppackrecommend.GRADE[vipLevel] || global.gameconfig.sppackrecommend.GRADE[0];

    // 档次下标
    let giftIndex = 0;

    for (let gf of giftList) {
        if (gf.PRICE >= grade) {
            break;
        }
        giftIndex++;
    }
    if (giftIndex >= giftList.length) {
        giftIndex = giftList.length - 1;
    }
    // 推荐的档次礼包
    let currentGift = giftList[giftIndex];

    // 获取 推荐礼包的配置 {MIN_LIMIT: 最低档次门限,  MAX_SUB: 最大档次递减次数}
    const giftConfig = global.gameconfig.others.RECOMMEND_GIFT || {MIN_LIMIT: 30, MAX_SUB: 2};

    if (currentGift.PRICE > giftConfig.MIN_LIMIT) { // 大于最低档次 就有再降档的可能
        // 找出最近历史推荐礼包(已经买的，或者过期的礼包
        const history = await this.find({
            rid: role.i(),
            vip: role.vip,
            $or: [
                {
                    expireAt: {$lte: Date.now()},
                },
                {
                    isBuy: {$gte: 1},
                },
            ],
        }).limit(giftConfig.MAX_SUB).sort({_id: -1});

        for (let gf of history) {
            if (gf.isBuy) { // 一旦有购买，就不往下降低档次
                break;
            }
            // 降低档次
            currentGift = giftList[--giftIndex];
            if (!currentGift || currentGift.PRICE < giftConfig.MIN_LIMIT) {
                currentGift = giftList[++giftIndex]; // 跌过最低档位，回档，同时避免配置错误导致的问题
                break;
            }
        }
    }
    // 保全 配置错误导致的 currentGift 为空，则使用最低档次的礼包
    currentGift = currentGift || giftList[0]; //
    // assert(currentGift, 'gift config error');

    const items = [...currentGift.ITEMS, ...calExpand(currentGift)];


    //

    return this.create({
        rid: role._id,
        vip: role.vip,
        type: giftType,
        create: now,
        expireAt: expireAt,
        price: currentGift.PRICE, // 档次 或者说 价格
        rewards: items,
        exp:currentGift.EXP
    });
};
