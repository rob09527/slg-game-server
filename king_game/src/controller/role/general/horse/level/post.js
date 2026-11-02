'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

// 升级

module.exports = exports = async (ctx, next) => {

    let num = ctx.request.body.num || 1;

    let { QUALITY, MAXLEVEL } = global.gameconfig.horseitem[ctx.horse.gsid];
    ctx.assert(ctx.horse.level + num <= MAXLEVEL, 'max level');

    const config = global.gameconfig.horselvlcost[QUALITY] || {}

    let rewards = {};
    for (let i = 0; i < num; ++i) {
        let items = config[ctx.horse.level + i - 1] || {};
        for (let item of items) {
            rewards[item.GSID] = rewards[item.GSID] || 0;
            rewards[item.GSID] += item.COUNT;
        }
    }
    let items = [];
    for (let gsid in rewards) {
        const count = rewards[gsid];
        if (count < 1) continue;
        items.push({ GSID: parseInt(gsid), COUNT: count });
    }

    const reason = { main: 'horse', sec: 'level' + ctx.horse.level + '-' + ctx.horse.level + num };
    ctx.role.castItemsNoSave(items, reason);
    ctx.horse.level += num;

    let horseCount = ctx.role.getItems(99560).count;
    let markcount = ctx.horse.level - horseCount
    if (markcount > 0) {
        //秘境主线任务打点
        await secretTask(ctx, 99560, markcount)
    }


    ctx.body = {
        castitems: items,
        info: ctx.horse.base()
    }

    ctx.role.missionInvoke('GENERAL_HORSE_LVUP');
}
