
'use strict'
// 获取巅峰赛信息
module.exports = exports = async (ctx, next) => {
    ctx.body = {}
    let { warzone } = ctx.request.body;

    const data = await ctx.dao.topking.formatInfo(ctx.role.servid, ctx.role.uid, warzone);
    if (data.error) {
        console.error(data.error)
        return;
    }
    let { kingdata, seadata, groupdata, type, currtype, round,needstop,time,locktime } = data;

    const bindUserInfo = ctx.dao.topking.bindUserInfo;

    if (kingdata.length > 0) {
        for (let king of kingdata) {
            for (let p of king.players) {
               p = await bindUserInfo(p);
            }
        }
    }
    if (seadata.length > 0) {
        for (let p of seadata) {
            p = await bindUserInfo(p);
        }
    }
    if (groupdata.length > 0) {
        for (let group of groupdata) {
            for (let p of group.players) {
                p = await bindUserInfo(p);
            }
        }
    }
    ctx.body = {
        kingdata,
        seadata,
        groupdata,
        type,
        currtype,
        round,
        time,
        locktime,
        needstop
    };
}
