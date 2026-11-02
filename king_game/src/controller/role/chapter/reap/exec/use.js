'use strict'

/**
 * 使用征收道具领取征收资源
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    const {gsid = 0, count = 1} = ctx.request.body;
    const reapConfig = global.gameconfig.chapter_reap[gsid];
    ctx.assert(reapConfig, 'invalid reap gsid');
    ctx.assert(count > 0, 'invalid count');
    const castitems = [{
        GSID: gsid,
        COUNT: count
    }];

    const {items = [],times, vip_ex} = ctx.role.reapRewardNoSave(reapConfig.HOUR * 3600 * 1000); // 计算征收奖励数
    // 增加随机掉落道具的征收逻辑
    const config = global.gameconfig.chapter[ctx.role.maxmapid];

    const drops = config.DROPS.map(drop => {
        let COUNT =  times * drop.CHANCE / 10000 * drop.COUNT;
        let ex = vip_ex.gsidEx[drop.GSID];
        if (ex){
            COUNT =  COUNT * (1 + ex / 1000);
        }
        return {
            GSID: drop.GSID,
            COUNT: Math.floor(COUNT)
        };
    })
    items.push(...drops);

    const rewardObj = {};
    items.forEach(_ => {
        _.COUNT *= count;
        if (rewardObj[_.GSID]) {
            rewardObj[_.GSID].COUNT += _.COUNT;
        } else {
            rewardObj[_.GSID] = _;
        }
    })
    const rewards = reapConfig.TO.map(toid => rewardObj[toid]).filter(Boolean);
    ctx.role.addItemsNoSave(rewards, {main: 'chapter', sec: 'hang props'});
    ctx.castitems = castitems;
    ctx.rewards = rewards;
    await next();
    ctx.body = {
        items: ctx.rewards,
        castitems: ctx.castitems
    }
}
