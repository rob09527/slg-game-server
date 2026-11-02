
'use strict'
// 武将-设置天赋
/**
 * @deprecated (废弃-改为武魂) soul
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    assert.fail('请升级客户端');
    // let { index, talent } = ctx.request.body;
    // ctx.assert(talent >= 1 && talent <= 5, 'invalid talent');
    // // 必须大于等于10星武将才能解锁天赋,index表示天赋的位置。10级解锁0位,11级解锁1位...
    // // 读配置查玩家的星级
    // let config = global.gameconfig.general[ctx.general.gsid];
    // let generalStar = config.STAR;
    // ctx.assert(generalStar - 10 >= index, 'invalid index');
    // // 10级能使用1-3的天赋数字,11级能使用1-4,12级1-5
    // ctx.assert(talent <= generalStar - 10 + 3, 'talent max');
    // // 设置消耗,每日刷新 90341
    // let gtalent = ctx.general.talent || [];
    // let talentCast = global.gameconfig.generaltalentcost;
    // ctx.assert(talentCast, 'talentCast config err');
    // let cost = [];
    // // 计算此次消耗标准,首次在该天赋位置设置不消耗
    // if (gtalent[index]) {
    //     let castIndex = ctx.role.getItems(90341).count >= talentCast.length ? talentCast.length - 1 : ctx.role.getItems(90341).count;
    //     ctx.assert(cost, 'costIndex err');
    //     cost = talentCast[castIndex];
    //     if (cost.COUNT > 0) ctx.role.castItemsNoSave(cost, {main: 'general', sec: 'talent'});
    //     ctx.role.addItemsNoSave({ GSID: 90341, COUNT: 1 })
    // }
    // gtalent[index] = talent;
    // ctx.general.talent = gtalent;
    // ctx.general.markModified('talent');
    // ctx.body = {
    //     talent: gtalent
    // }
}
