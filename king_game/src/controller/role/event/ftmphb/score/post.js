"use strict"

const timekey = require("../../../../../util/timekey");

/**
 * 分数汇报
 * @param {*} ctx 
 * @param {*} next 
 * @returns 
 */

module.exports = async function (ctx, next) {
    let {
        score
    } = ctx.request.body;
    let act = global.ACTIVITY['ftmphb']
    let etime = act.etime
    let start = act.start
    let nowtime = Date.now()
    ctx.assert(nowtime < etime, 'The game event has ended');
    ctx.assert(nowtime > start, 'Game activity is not started');
    ctx.assert(score < 1000, 'system score error ftmphb');
    await ctx.role.ftmphbinfo(ctx)

    const count = ctx.role.getItems(30181).count;

    ctx.assert(count > 0, 'Exhausted Times');

    if (ctx.role.ftmphb[timekey().ftmphb.dailykey_db] < score) {
        ctx.role.ftmphb[timekey().ftmphb.dailykey_db] = score
    }
    ctx.role.ftmphb[timekey().ftmphb.globalkey_db] += score

    await ctx.dao.role.updateOne({ _id: ctx.role.rid }, {
        $set: { ftmphb: ctx.role.ftmphb }
    });

    //排名写入redis
    let id = timekey().ftmphb.dailykey
    let groupid = ctx.role._gameserv.groupid;
    let rankService = new global.services.RankService(id, groupid);
    await rankService.set({
        id: ctx.role.i(),
        score: ctx.role.ftmphb[timekey().ftmphb.dailykey_db]
    });
    // role.level

    let globalrank = timekey().ftmphb.globalkey;
    let globalRankService = new global.services.RankService(globalrank);

    await globalRankService.set({
        id: ctx.role.i(),
        score: ctx.role.ftmphb[timekey().ftmphb.globalkey_db]
    });
    let items = [{ GSID: 30181, COUNT: 1 }]
    ctx.role.castItemsNoSave(items);
    await ctx.role.save();
    ctx.body = {
        state: "success",
        score: ctx.role.ftmphb[timekey().ftmphb.dateKey],
        totalscore: ctx.role.ftmphb[timekey().ftmphb.globalkey]
    }

}