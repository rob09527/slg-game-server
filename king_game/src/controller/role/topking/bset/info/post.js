'use strict'

const ms = require('ms');
const DELAY_INTERVAL = ms('7d');// 结束时间
// 获得巅峰赛玩家阵容
module.exports = exports = async (ctx, next) => {

    let {
        rids = []
    } = ctx.request.body;
    const cron = ctx.dao.topking.finishtime();
    let endDay = cron + DELAY_INTERVAL;

    ctx.body = [];
    for (let mix of rids) {
        let [
            uid,
            sid,
        ] = mix.split('|');
        ctx.assert(uid && sid, 'invalid data')
        let info = await ctx.dao.topking.findOne({servid: sid, uid}, {c_battleset: 1, isout: 1});
        let data = {
            bset: info.c_battleset,
            endtime: endDay,
            isout: info.isout
        }
        let player = await ctx.dao.role.getOtherInfoAndBattleSet({servid: sid, uid},'topkingpvp');
        let kingbset = player.battleset
        if (ctx.bseason().season != 4 || data.isout) {
            // 如果是已经淘汰或者不在冬季,返回阵容快照
            kingbset = data.bset;
        }
        player.kingbset = kingbset;
        player.battleset = undefined;
        ctx.body.push(player);
    }
}
