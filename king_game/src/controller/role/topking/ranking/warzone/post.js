'use strict'

async function areamark(ctx, params) {
    let {servid} = params;
    // 取到最新的赛制
    let cycleInfo = await ctx.dao.topkinglastservergroup.find({}, {cycle: 1}).sort({cycle: -1}).limit(1);
    if (cycleInfo.length > 0) cycleInfo = cycleInfo[0].cycle;
    let servergroup = await ctx.dao.topkinglastservergroup.find({cycle: cycleInfo});
    let warzonelist = [];
    let my; // 我的战区
    for (let info of servergroup) {
        if (info.servers.includes(servid)) my = info.areamark;
        warzonelist.push(info.areamark);
    }
    return {my, warzonelist};
}

// 获取上个赛季巅峰赛战区
module.exports = exports = async (ctx, next) => {

    let {servid} = ctx.request.body;
    ctx.assert(servid, 'invalid servid');

    let params = {
        servid
    }
    let data = await areamark(ctx, params);
    ctx.body = data
}
