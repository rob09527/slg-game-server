
'use strict'
// 积分宝箱-信息展示
module.exports = exports = async function (ctx, next) {

    let { BOX: box, EVENT: event } = ctx.config;
    event = event.map(({ INTRO: intro, MARK: mark, LIMIT: limit}) => ({ intro, mark, limit }));
    let record = ctx.role.jfbx;
    let totalScore = event.map(({ mark }) => ctx.role.getProp(mark)).reduce((sum, cur) => sum + cur, 0);
    console.log({totalScore}, ctx.role.getProp(90352))
    box = box.map(({ SCORE: score, REWARD }, index) => {
        let one = record[index] || 0;
        // 0 未达成 1 可领取 2 已领取
        let state = one == 1 ? 2 : (totalScore >= score ? 1 : 0);
        return { score, state, reward: REWARD.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }))}
    });
    ctx.body = {
        box,
        event
    }
}
