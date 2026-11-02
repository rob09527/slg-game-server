'use strict'
// 领取资源奖励
const bseason = require("./../../../../../util/battleseason");
module.exports = exports = async ctx => {
    let {pos} = ctx.request.body;
    let items = [];
    let buildingInfo = [];
    let manor_base = await ctx.manor.base();
    
    if (pos >= 0) {
        // 位置的资源
        let b_info = {};
        b_info[pos]= manor_base.buildinglist[pos]
        buildingInfo = b_info;
    } else {
        // 所有能获得的资源
        // 玩家建筑
        buildingInfo = manor_base.buildinglist;
    }
    ctx.assert(buildingInfo,'invalid pos');

    // 计算获得资源
    for (let b in buildingInfo) {
        let building = buildingInfo[b];
        if (!building) continue;
        if (building.items && building.items.length > 0) {
            building.lastgain = Date.now();
            items.append(building.items);
            building.items = [];
        }
    }
    // 更新
    if (pos >= 0 ) {
        ctx.manor.building[pos] =  buildingInfo[pos]
    }else {
        ctx.manor.building = buildingInfo;
    }
    ctx.manor.markModified('building');
    await ctx.manor.save();

    // 资源增加
    if (items.length > 0) {
        items = items.arrange();
        await ctx.role.addItemsNoSave(items);
        await global.dao.warorder.point(ctx.role, 90562);  // 卧龙战令-领取府邸收益
        await ctx.role.save();
        // 珍宝增幅
        for (let {GSID, gsid, COUNT, count} of items) {
            gsid = gsid || GSID;
            if (gsid != 38005 && gsid != 30026) continue;
            count = count || COUNT;
            let missionNames = {
                '38005': 'manor_yb_get',
                '30026': 'manor_lyd_get',
            };
            await ctx.role.zhenbaoMissionInvoke({missionName: missionNames[gsid], count});
        }
    }
    ctx.body = {
        items
    }
}
