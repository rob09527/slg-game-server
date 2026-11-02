"use strict"

// 信息获取
module.exports = async function (ctx, next) {
    const curperoid = ctx.zhdpoint("HHYYCOMMONDATE");
    ctx.assert(curperoid >= 0, "not_start");
    const { ITEMS } = global.gameconfig.zhd[ctx.zhdpoint("HHYYCFG")];
    // 本期中奖玩家
    let prize = await ctx.commonsend("/activityinfo/fmoon/log", { peroid: curperoid });
    let fmoon = await ctx.commonsend("/activityinfo/fmoon/moon/peroid", { peroid: curperoid });
    const { START, END } = ITEMS[curperoid];
    let status = 0;
    if(Date.in(Date.parse(START), Date.parse(END))) {
       if(fmoon.findIndex(({ _id }) => _id.servid == ctx.role.servid && _id.rid == ctx.role.i()) >= 0) status = 2;
       else status = 1;
    } else if (Date.now() > Date.parse(END)) {
        status = 3;
    }
    const arrreward = prize.filter(({ peroid, rid, servid }) =>
        peroid == curperoid && servid == ctx.role.servid && rid == ctx.role.i())
        .map(({ task }) => task);
    ctx.body = {
        curperson: fmoon.length,    // 本期许愿人数
        curperoid,                  // 当前期数下标
        status,                     // 0-只展示，1-可许愿，2-已许愿，3-已结束
        arrreward,                  // 许愿中奖任务下标
        info: ITEMS.map(({ REFRESH: refresh, START: start, END: end, WREWARD: wreward, ITEMS }) => ({
            refresh, start, end, wreward, items: ITEMS.map(({ SNUM: snum, ISCVIP: iscvip, REWARD: reward }) => ({
                snum, iscvip, reward,
            })),
        })),
        prize: prize.map(({ servid, name, reward, servname }) => ({ servid, name, reward, servname })),
    }
}