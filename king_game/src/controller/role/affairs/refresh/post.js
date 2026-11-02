'use strict'
const { hitHere } = require("../../../../util/weektarget");

/**
 * @author awko 改
 * @type {exports}
 */
module.exports = exports = async function (ctx, next) {
    ctx.assert(ctx.affairs, 'invalid affairs');
    let totalLength = ctx.affairs.missions.length;
    ctx.affairs.missions = ctx.affairs.missions.filter(function (m) {
        return m.etime || m.lock;
    })
    const vip_ex = global.gameconfig.vip.EX_AFF[ctx.role.vip];
    // 刷新未被锁住的任务
    const total = totalLength - ctx.affairs.missions.length;
    ctx.assert(total > 0, 'cant refresh');

    // 扣除道具数量与刷新数量成正比
    const refreshCast = global.gameconfig.others.AFFAIRS.REFRESH_CAST || {gsid: 38005, count: 10};
    const castItems = [{ GSID: refreshCast.GSID, COUNT: refreshCast.COUNT * total }]
    ctx.role.castItemsNoSave(castItems);

    let affairConfig = global.gameconfig.affairs;
    // 根据内政等级来过滤内政任务星级
    affairConfig = affairConfig.filter(ac => ctx.levelConfig.STAR_SOLO.indexOf(ac.STAR) >= 0);

    ctx.affairs.missions.append(ctx.rand_m(total, affairConfig));
    ctx.affairs.markModified('missions');

    // 新七日目标，刷新告示栏次数
	hitHere(ctx.role, 98660, 1, true);

    await ctx.role.save();
    await ctx.affairs.save();
    ctx.body = {
        missions: ctx.affairs.missions,
        castitems: castItems
    };
    // 打印招募消耗元宝数量日志
    ctx.khlog.ybcastprint('missionref', ctx.role.uid, castItems);
}
