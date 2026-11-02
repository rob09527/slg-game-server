
'use strict'

async function rankInfo(ctx, params) {
    let { warzone } = params;
    // 取出玩家点赞的mark
    // 根据战区找出全服霸主列表
    // 赛季
    let cycle = 0;
    // 查历史最新的cycle
    let cycleInfo = await ctx.dao.topkinglastservergroup.find({}, { cycle: 1 }).sort({ cycle: -1 }).limit(1);
    if (cycleInfo.length > 0) cycle = cycleInfo[0].cycle;
    let toprank = await ctx.dao.topkingrank.find({ areamark: warzone, finish: { $exists: 0 } }, { servid: 1, uid: 1, mark: 1, support: 1, index: 1, cycle: 1, areamark: 1 }).sort({ index: 1 });
    // 记录赛季
    if (toprank.length > 0) cycle = toprank[0].cycle;
    return {
        toprank,
        cycle
    }
}

// 获取全服霸主信息
module.exports = exports = async (ctx, next) => {

    let { warzone } = ctx.request.body;
    ctx.assert(warzone, 'invalid warzone');

    let params = {
        warzone,
        servid: ctx.role.servid,
        uid: ctx.role.uid
    }
    let data = await rankInfo(ctx, params);
    let list = [];
    if (data && data.toprank) {
        let userList = data.toprank;
        for (let user of userList) {
            user = user.toObject();
            user = await ctx.dao.topking.bindUserInfo(user);
            list.push(user);
        }
    }

    ctx.body = {
        cycle: data ? data.cycle : null,
        list
    }
}
