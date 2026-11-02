'use strict'

const LOTTERY = global.gameconfig.others.TOPKINGPVP.LOTTERY;

module.exports = exports = async function (ctx, next) {
    ctx.pay = LOTTERY.BASE + (ctx.role.level * LOTTERY.RATE);

    let cond = {
        expire: {$exists: false},
        servid: ctx.role.servid,
        uid: ctx.role.uid,
    }
    ctx.area = await ctx.dao.topkingservergroup.findOne({servid: ctx.role.servid});
    ctx.assert(ctx.area, 'nin area');
    ctx.lottery = await ctx.dao.lottery.findOne(cond);

    await next();
}
