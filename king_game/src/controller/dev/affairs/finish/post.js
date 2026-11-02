
'use strict'
// 手动把内政任务设置为已完成
module.exports = exports = async function (ctx, next) {
    ctx.body = {};
    const { rid } = ctx.request.body;
    ctx.assert(rid, 'need rid');
    let info = await ctx.dao.affairs.findOne({ rid }, { rid: 1, missions: 1 });
    if (info) {
        let missions = info.missions
        for (let one of missions) {
            one.etime = 1;
        }
        await info.updateOne({ $set: { missions } })
    }

}