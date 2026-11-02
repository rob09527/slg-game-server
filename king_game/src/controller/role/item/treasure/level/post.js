'use strict'

module.exports = exports = async (ctx, next) => {

    let treasure, general;
    if (ctx.request.body.guid) {
        general = await ctx.role.findGenerals(ctx.request.body.guid);
        ctx.assert(general, 'invalid guid');
        treasure = general.treasure;
    } else {
        treasure = ctx.request.body.treasure;
    }
    // 觉醒宝物
    let awake_treasure;
    if (treasure.length === 24) {
        awake_treasure = await ctx.dao.awake_treasure.findOne({_id: treasure});
        ctx.assert(awake_treasure, 'invalid treasure');
        // 检查当前星级是否觉醒
        ctx.assert(awake_treasure.awaketime, 'not awake');
        treasure = awake_treasure.gsid;
    }
    const config = global.gameconfig.treasure[treasure];
    ctx.assert(config, 'invalid treasure');
    ctx.assert(config.NEXT, 'cant lvup');
    // 检查7星觉醒
    if (config.STAR >= 6) ctx.assert(awake_treasure, 'awake first');

    let items = ctx.request.body.consume || [];
    ctx.role.castItemsNoSave(items);

    let exp = 0;
    for (let item of items) {
        const gsid = item.GSID || item.gsid;
        const conf = global.gameconfig.treasure[gsid];
        if (!conf) continue;
        const count = item.COUNT || item.count;
        if (typeof count === 'number') exp += conf.EXP * count;
    }

    // 经验不够的判断
    ctx.assert(exp >= config.NEXT.EXP, 'more exp');

    exp -= config.NEXT.EXP;

    // @author awko, 增加轮升
    let targetId = config.NEXT.ID; // 把下一级的ID 设置为 升级目标ID
    let targetConfig = global.gameconfig.treasure[targetId]; // 获取目标ID的配置

    const invokeTreasure = ()=> {
        let new_treasure = {onlystar: 1, gsid: targetId, count: 1};
        // 历史 X 星宝物获得
        ctx.role.missionInvoke('EQUIP_TREASURE_CHK', new_treasure);
        // 为了触发推荐礼包
        ctx.role["TREASURE_STAR"] = targetConfig.STAR;
    }
    invokeTreasure();
    // 如果 目标ID有下一级配置，且经验足够
    // 觉醒宝物不可轮升
    while (!awake_treasure && targetConfig && targetConfig.NEXT && exp >= targetConfig.NEXT.EXP) {
        if (targetConfig.STAR >= 6) break;
        targetId = targetConfig.NEXT.ID; // 提升目标等级
        exp -= targetConfig.NEXT.EXP;
        targetConfig = global.gameconfig.treasure[targetId];
        invokeTreasure();
    }

    ctx.body = {
        general,
        items: [],
        castitems : items,

    }
    if (exp > 0) ctx.body.items.push({gsid: global.gameconfig.others.TREASURE_DUST, count: exp});

    if (!general && !awake_treasure) {
        let new_treasure = {onlystar: 1, gsid: targetId, count: 1};
        ctx.role.castItemsNoSave({gsid: parseInt(treasure), count: 1});
        ctx.body.items.push(new_treasure);

    } else {
        // 修改觉醒宝物的gsid到下一级宝物
        if (awake_treasure) {
            // updateOne需要修改awake_treasure.gsid,就不折腾了
            awake_treasure.gsid = targetId;
            awake_treasure.awaketime = undefined;

            await awake_treasure.save();
        }
        if (general) {
            // 觉醒宝物无需改变
            if (!awake_treasure) general.treasure = targetId;
            await general.save();
            // 挂载觉醒宝物
            if (awake_treasure) general._awaketreasure = await awake_treasure.base();
            ctx.body.general = general.base();
            // 更新队伍信息
            await general.updateBattleSet(); // 内部有 role save 逻辑
        }
    }
    ctx.role.addItemsNoSave(ctx.body.items);
    await ctx.role.save();
}
