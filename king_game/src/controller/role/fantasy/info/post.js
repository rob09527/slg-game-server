'use strict'
/**
 *  获取奇门幻阵数据
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

    const { expireAt, nextidx, bossidx, bossid, nextBossTime } = ctx.bossConfig;

    const { BOSS: bossArr } = global.gameconfig.fantasy;
    // 获取下一个BOSS信息
    let nextIndex = nextidx != undefined ? nextidx : (bossidx + 1);
    nextIndex = nextIndex >= bossArr.length ? 0 : nextIndex; // 当超出最后一个时进行轮回
    const nextBoss = bossArr[nextIndex] || {};
    if (expireAt < Date.now()) {
        ctx.body = {// 过了挑战期返回部分数据
            nextBossTime,
            nextBossId: nextBoss.BOSSID || 0
        }
    }
    else {
        // 当前活动最高伤害
        const lastdamge = await ctx.fantasyRank.getItemScore(ctx.role.i()) || 0;
        // 当前活动排名
        const rank = await ctx.fantasyRank.getItemRank(ctx.role.i()) || 0;

        ctx.body = {
            bossidx,
            bossid, // 对手id
            expireAt,
            nextBossTime,
            rank,
            lastdamge,
            nextBossId: nextBoss.BOSSID || 0
        }
    }

}