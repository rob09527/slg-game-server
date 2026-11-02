'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");
const coolingRedis = require("../../../../../util/coolingRedis");


// 建筑升级/建造
module.exports = exports = async (ctx, next) => {
    // 默认升级府邸
    let { bid, pos } = ctx.request.body;
    let { HOME: home = [], UP_BUILDING } = global.gameconfig.newmanor;

    ctx.assert(home.length > 0, 'invalid config');
    let result = await coolingRedis(ctx.role.rid, "get", bid)
    ctx.assert(!result, 'insufficient cooling time');
    let coolingConfig = {}
    // 升级建筑
    let manorConfig = home[ctx.manor.mlv() - 1];
    bid = bid || pos || 1; // 兼容之前的设计，但是现在 pos 和  bid 为 一样的值
    let castitems;
    let unlock = [];
    if (bid > 1) {
        // 为了不修改之前的表设计 bid, pos 都为一样的值
        ctx.assert(ctx.manor.building && ctx.manor.building[bid], 'has building');
        let buildInfo = ctx.manor.building[bid];
        // 升级建筑不能超过府邸建筑限制
        ctx.assert(buildInfo.lv < manorConfig.OTHER_BUILD_LVMAX, 'building lv max');
        let updateBuilding = UP_BUILDING[bid].INFO;
        castitems = updateBuilding[buildInfo.lv].COST;
        coolingConfig = updateBuilding[buildInfo.lv]
        ctx.assert(castitems, 'building max lv');
        ctx.role.castItemsNoSave(castitems);
        buildInfo.lv++;
        ctx.manor.building[bid] = buildInfo;
        ctx.manor.markModified('building');
        await ctx.manor.save();
        await ctx.role.save();
    } else {
        // 升级府邸
        let updateManor = UP_BUILDING[1].INFO;
        const config = updateManor[ctx.manor.mlv()];
        coolingConfig = config
        // 府邸升级配置中无，已经是最高级
        ctx.assert(config, 'manor max lv');
        // 判断是否达到野怪难度等级
        ctx.assert(ctx.manor.monsterlv >= config.MONSTER_LV, 'monster lv no enough')
        castitems = config.COST;
        // 如果配置不大于0,说明到了最后一个配置
        castitems = castitems.filter(items => items.COUNT > 0);
        ctx.assert(castitems.length > 0, 'manor max lv');
        ctx.role.castItemsNoSave(castitems);

        if (config.UN_LOCK) { // 如果有此次升级带来了建造解锁，则创建该建筑
            let buildings = await ctx.manor.addBuilding(config.UN_LOCK);
            ctx.manor.building = buildings;
            ctx.manor.markModified('building');
            // 返回刚解锁的建筑
            for (let b in buildings) {
                if (buildings[b] && buildings[b].lv == 1) unlock.push(buildings);
            }
        }
        // 自动升级建筑
        let homeConfig = home[ctx.manor.mlevel];
        let buildlist = await ctx.manor.autoUpBuilding(homeConfig.BUILDING || {});
        ctx.manor.building = buildlist;
        ctx.manor.markModified('building');
        // 升级建筑
        ctx.manor.mlevel++;
        ctx.manor.markModified('mlevel');
        await ctx.manor.save();
        await secretTask(ctx, 99562, 1)
        //秘境主线任务打点

    }
    ctx.role.missionInvoke('MANOR_BUILDING_LVUP');

    await ctx.role.save();
    await coolingRedis(ctx.role.rid, 'level', bid, coolingConfig)
    ctx.body = {
        castitems,
        unlock,
    }
}
