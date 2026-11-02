'use strict'

// const { hitHere } = require("../../../../../util/weektarget");

/**
 * 装备升级
 * @deprecated 改回去了
 * @author awko
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    assert.fail('deprecated');
    // const equip = ctx.request.body.equip;
    // let general;
    //
    // if (ctx.request.body.guid) {
    //     general = await ctx.role.findGenerals(ctx.request.body.guid);
    //     ctx.assert(general, 'invalid guid');
    //     // 该装备没有在武将身上抛出错误
    //     ctx.assert(general.equip && general.equip.indexOf(equip) >= 0, 'general no wear');
    // }
    //
    // const config = global.gameconfig.equip[equip];
    // ctx.assert(config, 'invalid equip');
    // ctx.assert(config.NEXT, 'cant lvup');
    //
    // let items = ctx.request.body.consume || [];
    // ctx.role.castItemsNoSave(config.NEXT.CONSUME);  // 升级额外需要的消耗
    //
    // ctx.role.castItemsNoSave(items);
    //
    // let exp = 0;
    // for (let item of items) {
    //     const gsid = item.GSID || item.gsid;
    //     const conf = global.gameconfig.equip[gsid];
    //     if (!conf) continue;
    //     // POS === 0是材料
    //     if (conf.POS !== 0 && conf.POS !== config.POS) {
    //         // 装备部位不一致的材料忽略
    //         continue;
    //     }
    //     const count = item.COUNT || item.count;
    //     if (typeof count === 'number') exp += conf.EXP * count;
    // }
    //
    // // 经验不够的判断
    // ctx.assert(exp >= config.NEXT.EXP, 'more exp');
    //
    // exp -= config.NEXT.EXP;
    //
    // // 轮升 逻辑
    // let targetId = config.NEXT.ID; // 把下一级的ID 设置为 升级目标ID
    // let targetConfig = global.gameconfig.equip[targetId]; // 获取目标ID的配置
    //
    // // 如果 目标ID有下一级配置，且经验足够
    // while (targetConfig && targetConfig.NEXT && exp >= targetConfig.NEXT.EXP) {
    //     ctx.role.castItemsNoSave(targetConfig.NEXT.CONSUME);  // 升级额外需要的消耗
    //     targetId = targetConfig.NEXT.ID; // 提升目标等级
    //     exp -= targetConfig.NEXT.EXP;
    //     targetConfig = global.gameconfig.equip[targetId];
    // }
    //
    // ctx.body = [];
    // const dustConfig = global.gameconfig.equip[global.gameconfig.others.EQUIP_DUST];
    //
    // // 补发 铸铁精华
    // if (exp >= dustConfig.EXP) ctx.body.push({
    //     gsid: global.gameconfig.others.EQUIP_DUST,
    //     count: Math.floor(exp / dustConfig.EXP)
    // });
    //
    // let new_treasure = {onlystar: 1, gsid: targetId, count: 1};
    // const result = {};
    // result.castitems = [...ctx.role.cast_items];
    //
    // if (!general) {
    //     ctx.role.castItemsNoSave({gsid: parseInt(equip), count: 1});
    //     ctx.body.push(new_treasure);
    //     ctx.role.addItemsNoSave(ctx.body);
    // } else {
    //     general.equip[config.POS - 1] = targetId;
    //     general.markModified('equip');
    //     ctx.role.addItemsNoSave(ctx.body);
    //
    //     await general.save();
    //     // 更新队伍信息
    //     await general.updateBattleSet();
    // }
    // //
    //
    //
    //
    // result.items = ctx.body;
    // result.general = general && general.base();
    // ctx.body = result; // 返回数据 重新包装
    // // 七日目标-装备升级次数
    // hitHere(ctx.role, 94205, 1, true);
    // await ctx.role.missionInvoke('HECHENG_DAILY_HISTORY', 1).save();
}
