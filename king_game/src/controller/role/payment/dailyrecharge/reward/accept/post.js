
'use strict'

const lodash = require('lodash')

module.exports = async function(ctx, next) {
    const {
        rewardindex = [],
    } = ctx.request.body;

    const {
        AMOUNT,
        POOLS,
        MARK,
    } = ctx.config;
    // 是否已领取奖励
    ctx.assert(ctx.role.getProp(MARK) < 1, 'already toke');
    // 是否达到充值额度
    ctx.assert(ctx.role.getProp(90221) >= AMOUNT, 'recharge first');
    // 是否选择了全部奖池
    ctx.assert(rewardindex.length === POOLS.length, 'ridxlen err');
    let items = [];
    for (let i = 0; ; i++) {
        let _config = POOLS[i];
        if (!_config) break;
        let {
            POOL,
            LIMIT,
        } = _config;
        const choicelist = rewardindex[i];
        ctx.assert(choicelist && choicelist.length === LIMIT, 'indexlen err');
        let _items = choicelist.map(idx => {
            const _item = POOL[idx];
            ctx.assert(_item, 'invalid itemconf');
            return _item;
        })
        items.push(..._items);
    }
    // 领取标记
    ctx.role.addItemsNoSave(MARK);
    // 奖励道具
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = {
        items,
    }
}