
'use strict'

const startGsid = {128:98425, 648:98427}

const finalGsid = {128:98426, 648:98428}

const $ = require("lodash");

module.exports = async ctx => {
    let {
        type: is_finial, price
    } = ctx.request.body;

    let index = global.gameconfig.zhenbao_fund.findIndex(({PRICE})=>PRICE==price)
    ctx.assert(index >= 0, 'index not find');

    is_finial = +is_finial;
    const {
        DAILY_REWARD,
        FINIAL_REWARD,
    } = global.gameconfig.zhenbao_fund_reward[index];
    ctx.assert(index == 0 ? ctx.role.zhenbao_fund_buytime : ctx.role.zhenbao_fund_buytime1 , 'buy first');
    const start = ctx.role.getProp(startGsid[price]);
    let items = [];
    // 终极奖励
    if (is_finial) {
        ctx.assert(start >= DAILY_REWARD.length, 'not yet');
        const is_toke = ctx.role.getProp(finalGsid[price]);
        ctx.assert(!is_toke, 'already toke');
        items = FINIAL_REWARD;
        ctx.role.addItemsNoSave(finalGsid[price]);
    } else {
        // 根据领取天数和累计天数领取所有可以领取的奖励
        ctx.assert(start < DAILY_REWARD.length, 'no more');
        const days = new Date(index == 0 ? ctx.role.zhenbao_fund_start : ctx.role.zhenbao_fund_start1).dayFromNow();
        items = DAILY_REWARD.slice(start, days);
        items = $.flattenDeep(items).arrange();
        ctx.role.addItemsNoSave({gsid: startGsid[price], count: days - start});
    }
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = {
        items,
    }
}