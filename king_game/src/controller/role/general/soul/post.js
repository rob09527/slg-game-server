'use strict'

/**
 * 武将-设置天赋
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {

    const {index, soul} = ctx.request.body;
    ctx.assert(!ctx.general.inherit || !ctx.general.inherit.prop || !ctx.general.inherit.prop.includes('soul'), 'soul lock'); //  继承，则不能操作
    const soulConfig = global.gameconfig.generalsoul;
    const posLockConfig = global.gameconfig.generalsoulposlock;

    ctx.assert(soulConfig && posLockConfig, 'generalsoul or generalsoulposlock config err');
    const targetSoulConfig = soulConfig[soul];
    ctx.assert(targetSoulConfig, 'invalid soul');
    ctx.assert(index !== undefined && index >= 0, 'invalid index');
    // 必须大于等于10星武将才能解锁天赋,index表示天赋的位置。10级解锁0位,11级解锁1位...
    // 读配置查玩家的星级
    let config = global.gameconfig.general[ctx.general.gsid];
    let generalStar = config.STAR;

    // 武将的星数，大于等于 该武魂位需要的星级
    ctx.assert(posLockConfig[index] && generalStar >= posLockConfig[index], 'index locked');

    // 武将的星数 大于等于 该武魂需要的星级
    ctx.assert(generalStar >= targetSoulConfig.LOCK, 'soul locked');

    // 设置消耗,每日刷新 90341
    const gsoul = ctx.general.soul || [];
    let talentCast = global.gameconfig.generaltalentcost;
    ctx.assert(!gsoul.includes(soul), 'soul exists'); // 新增逻辑武魂不能重复逻辑
    ctx.assert(talentCast, 'talentCast config err');
    let cost = [];

    // 计算此次消耗标准,首次在该武魂位置设置不消耗
    if (gsoul[index]) {
        let castIndex = ctx.role.getItems(90341).count >= talentCast.length ? talentCast.length - 1 : ctx.role.getItems(90341).count;
        ctx.assert(cost, 'costIndex err');
        cost = talentCast[castIndex];
        if (cost.COUNT > 0) ctx.role.castItemsNoSave(cost, {main: 'general', sec: 'soul'});
        ctx.role.addItemsNoSave({GSID: 90341, COUNT: 1})
    }
    gsoul[index] = soul;
    ctx.general.soul = gsoul;
    ctx.general.markModified('soul');
    ctx.body = {
        castitems: cost,
        general: ctx.general.base(),
    };
}
