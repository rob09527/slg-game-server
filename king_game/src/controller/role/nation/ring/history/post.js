'use strict';

/*
* 国战擂台记录
* */
module.exports = exports = async (ctx, next) => {
    const rid = ctx.role.i();
    const servid = ctx.role.servid;
    const { type } = ctx.request.body;
    ctx.body = [];
    // 缓存5分钟
    let item = await global.services.WangpvpService.find("nation:ring_history:" + `${rid}_${servid}_${type}`);
    if (!item || Object.keys(item).length == 0) {
        ctx.body = await ctx.dao.ringhistory.getHistory({ rid, servid, type })
        await global.services.WangpvpService.set("nation:ring_history:" + `${rid}_${servid}_${type}`, ctx.body, 5 * 60);
    }
};
