
'use strict'

module.exports = exports = async (ctx, next) => {
    let baseInfo = await ctx.record.base();
    // console.log("<--- ctx.baseInfo =", baseInfo)

    ctx.body = ctx.config.map((elem, index) => {
        let { INTRO: intro, REWARDS: rewards, CONDS } = elem;

        let nowcost = +baseInfo.totals[CONDS[0]?.COND] || 0;
        let needcost = +CONDS[0]?.COUNT;
        return {
            intro,
            rewards,
            needcost, // 需要消耗
            nowcost,// 当前已消耗
            status: baseInfo.rewardtime[index] ? 2 : +nowcost >= +needcost ? 1 : 0, //0/1/2, 未达成/可领取/已领取
        }
    });
}
