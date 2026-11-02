
'use strict'

module.exports = exports = async function (ctx, next) {
    ctx.body = {score:ctx.mongoFind.score, etime:ctx.etime, reward:[], stage:ctx.mongoFind.stage};
    let stageReward = ctx.CONFIG.stageReward;
    for (let stage in stageReward) {
        let info = stageReward[stage];
        let obj = {};
        obj.stage = stage;
        obj.items = info.ITEMS;
        obj.score = info.SCORE;
        obj.boss = info.BOSS;
        obj.status = ctx.CACHE.flag[stage] ? 0 : ctx.mongoFind.stage >= stage && ctx.mongoFind.score >= obj.score ? 1 : 2;
        ctx.body.reward.push(obj);
    }
    ctx.body.monsterNumber = ctx.CACHE.monsterNumber;
    ctx.body.residue = ctx.CACHE.monster.length;
    
    let date = new Date();
    let now = date.getTime();
    let freshTime = date.setHours(date.getHours() + 1, 0, 0, 0);
    ctx.body.time = (ctx.CONFIG.config.FRESH - ctx.mongoFind.hour - 1) * 3600000 - now + freshTime;
}