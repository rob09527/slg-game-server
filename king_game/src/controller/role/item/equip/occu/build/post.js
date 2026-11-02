'use strict'
// 职业T级装备-打造
// 返回穿上装备后的武将信息
module.exports = exports = async (ctx, next) => {
    let { beforequip, equip, guid } = ctx.request.body;
    ctx.assert(beforequip, 'invalid beforequip');
    ctx.assert(equip, 'invalid equip');
    ctx.assert(guid, 'invalid guid');
    let general;
    if (ctx.request.body.guid) {
        general = await ctx.role.findGenerals(guid);
        ctx.assert(general, 'invalid guid');
        // 该装备没有在武将身上抛出错误
        ctx.assert(general.equip && general.equip.indexOf(beforequip) >= 0, 'general no wear');
    }
    // 判断是否满足消耗
    const config = global.gameconfig.occuequip[equip];
    ctx.assert(config, 'invalid equip');

    // 判断部位是否相等
    let beforconfig;
    beforconfig = global.gameconfig.occuequip[beforequip];
    if (!beforconfig) {
        // 普通装备
        beforconfig = global.gameconfig.equip[beforequip];
        // 判断是否是顶级,只有顶级才能进行打造
        // 有下一等级的字段,就说明不是顶级
        ctx.assert(!beforconfig.NEXT, 'beforequip need max quality');
    }

    // 比较装备部位
    ctx.assert(config.POS == beforconfig.POS, 'invalid equip pos');
    // 取下该装备
    ctx.role.addItemsNoSave({ gsid: beforequip, count: 1, unmark: 1 });
    // 获得
    let items = [{ "gsid": equip, "count": 1 }];
    // 判断是否够消耗
    let castitems = [];
    castitems.append(config.EQUIP_CAST);
    castitems.append(config.OTHERS_CAST);
    ctx.role.castItemsNoSave(castitems);
    await ctx.role.save();
    general.equip[config.POS - 1] = parseInt(equip);
    general.markModified('equip');
    await general.save();
    // 更新队伍信息
    await general.updateBattleSet();
    general = general && general.base();

    ctx.role.OCC_EQUIP = config.TTAG; // 标记触发字段 ,目前是作为跑马灯的触发  看 houseLampNotify.js
    ctx.role.OCC_EQUIP_GSID = equip;
    ctx.body = {
        items,
        castitems,
        general
    }
    await ctx.role.missionInvoke('HECHENG_DAILY_HISTORY', 1).save();
}
