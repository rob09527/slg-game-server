'use strict'

// 信息查询
module.exports = async function (ctx, next) {
    const { FULL, ITEMS } = ctx.config;
    const record = ctx.role[ctx.lxljcz];
    ctx.body = {};

    let now = new Date().setHours(0, 0, 0, 0);

    let today = record.task.find(value => value.time == now);
    if (!today) {
        for (let i = 0; i < ITEMS.length; i++) {
            let info = record.task[i];
            if (info.num < ITEMS[i].NUM) {
                info.time = now;
                info.num = 0;
                info.got = 0;
                break;
            }
        }
    }

    let cur = 0;
    ctx.body.day = ITEMS.map((each, index) => {
        // 0 => 已领取 1 => 已达成未领取 2 => 未达成
        let info = record.task[index];
        let status = info.got ? 0 : info.num >= each.NUM ? 1 : 2;
        status != 2 && cur++;
        return { price: each.NUM, status, items: ctx.lowerGsid(each.ITEMS), time: each.TIME, money: info.num, title: each.TITLE, index }
    });
    ctx.body.full = {
        all: FULL.NUM,
        cur,
        items: ctx.lowerGsid(FULL.ITEMS),
        status: record.all.got ? 0 : cur >= FULL.NUM ? 1 : 2,
    }
    let act = global.ACTIVITY[ctx.lxljcz];
    const { params, ...out } = act.base(ctx.role);
    ctx.body.etime = (out && out.etime) || Date.now();
}