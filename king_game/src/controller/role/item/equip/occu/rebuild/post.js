'use strict'
// 职业T级装备-重铸
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
    // 比较装备部位
    ctx.assert(config.POS == beforconfig.POS, 'invalid equip pos');
    let ecast = config.EQUIP_CAST;
    let ebcast = beforconfig.EQUIP_CAST;
    // 根据合成该装备的消耗装备。判断重铸前后的装备是否是同一个级别
    // 消耗装备的数量是否相等
    let count = 0;
    for (let cast of ecast) {
        count = 0;
        for (let bcast of ebcast) {
            if (cast.GSID == bcast.GSID && cast.COUNT == bcast.COUNT) {
                // gsid和数量都相等
                count++;
                break;
            }
        }
        if (count == 0) break;
    }
    ctx.assert(count != 0, 'equip cast no equal');
    // 获得
    let items = [{ "gsid": equip, "count": 1 }];
    // 判断是否够消耗
    let castitems = [];
    castitems.append(config.REBUILD);
    ctx.role.castItemsNoSave(castitems);
    await ctx.role.save();
    general.equip[config.POS - 1] = parseInt(equip);
    general.markModified('equip');
    await general.save();
    // 更新队伍信息
    await general.updateBattleSet();
    general = general && general.base();
    ctx.body = {
        items,
        castitems,
        general
    }
}
