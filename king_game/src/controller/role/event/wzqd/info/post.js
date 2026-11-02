'use strict'

// 信息查询
module.exports = async function (ctx, next) {
    let {
        WZQD: {
            MARK: mark, LIMIT: limit, MAXCOUNT: maxcount,
            ITEMS: rewards, BOXLIST: boxlist,
        }
    } = global.gameconfig.zhd;
    let { total: nowcount } = await ctx.commonsend('/activityinfo/total/get', {});
    rewards = ctx.lowerGsid(rewards);
    boxlist = boxlist.map((box, index) => {
        let record = ctx.role.wzqd || [];
        let one = record[index] || 0;
        // 1 => 已达成未领取 0 => 未达成
        let status = (nowcount / maxcount) * 100 >= box.PROB ? 1 : 0;
        if (one == 1) status = 2; // 已领取
        return { status, prob: box.PROB, rewards: ctx.lowerGsid(box.ITEMS) }
    })
    ctx.body = {
        mark, limit, rewards,
        nowcount, maxcount, boxlist,
    };
}