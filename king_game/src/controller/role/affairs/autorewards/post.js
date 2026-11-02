'use strict'

require('rx-apiwheel');
const _key = {
    friend: 'friendsMissions',
    solo: 'missions'
};
/**
 * 一键完成悬赏任务完成 并领奖
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {


    ctx.assert(ctx.affairs, 'no finished mission');
    const type = ctx.request.body.type || 'solo';

    ctx.missionKey = _key[type];
    ctx.assert(ctx.missionKey, 'invalid mission type');

    const missions = ctx.affairs[ctx.missionKey] || [];

    let finishedMissions = [];
    let unfinishedMissions = [];

    for (let item of missions) {
        Date.now() >= item.etime ? finishedMissions.push(item) : unfinishedMissions.push(item);
    }
    let bossesReward = [];
    if (ctx.request.body.type === 'friend') {
        // 好友任务一键领取新增 好友boss 的领取
        const ownerId = ctx.role.i();
        const rids = [ownerId, ...(ctx.role.friends || [])];

        const bosses = await ctx.dao.fboss.fetchBosses(rids, ownerId);
        const recBossId = [];
        for (let bo of bosses) {
            const rw = bo.uncollectedReward;
            if (!rw) {
                continue;
            }
            bossesReward.push(...rw);
            recBossId.push(bo._id);
        }

        if(recBossId.length > 0){

            let up = {
                $rename: {[`reward.${ownerId}`]: `reward.${ownerId}-rec`}
            };

            const r = await ctx.dao.fboss.updateMany({_id: {$in: recBossId}}, up);

            ctx.role.addItemsNoSave(bossesReward, {main: 'affairs friends fboss', sec: 'affairs'});

            ctx.dao.fboss.find({_id: {$in: recBossId}}).then(bosses => {
                // 领取完毕标记，提升boss查询效率
                let isRecFinish = true;
                bosses.forEach(boss => {
                    for (let k in boss.reward) {
                        if (!k.endsWith('-rec')) { // 仍然有未被领取的
                            isRecFinish = false;
                            break;
                        }
                    }
                    if (isRecFinish) {
                        boss.killed = 2;
                    }
                    return  boss.save();
                })
            });

        }
        await global.dao.warorder.point(ctx.role, 90568, finishedMissions.length, true);  // 卧龙战令-互动悬赏
    }
    ctx.assert(bossesReward.length > 0 || finishedMissions.length > 0, 'no finished mission or boss');

    if (finishedMissions.length <= 0){

        await ctx.role.save();
        return ctx.body = {
            reward: bossesReward,
            items: [
                {...ctx.role.getItems(90444), gsid: 90444},
                {...ctx.role.getItems(90445), gsid: 90445},
                {...ctx.role.getItems(38012), gsid: 38012},
            ]
        };
    }


    const {rewards, confirm} = ctx.dao.affairs.getRewards(finishedMissions, ctx.levelConfig, ctx.missionKey === 'missions' ? 0 : 1);


    if (ctx.missionKey === 'missions' && rewards.length > 0) {
        ctx.jobtask({mark: 90381, rid: ctx.role._id}).catch(console.error);
        for (let mission of finishedMissions) {
            let _conf = global.gameconfig.affairs.deepQueryOne('ID', mission.id);
            if (!_conf) continue;
            await ctx.role.missionInvoke('AFFAIRS_FINISH_SOLO', _conf.STAR);
        }
    }



    const res = await confirm(ctx.role);

    ctx.affairs[ctx.missionKey] = unfinishedMissions;
    ctx.affairs.markModified(ctx.missionKey);
    await ctx.affairs.save();


    // 和接口文档保持一致，这里暂时就这么写了
    res.reward = [...res.rewards, ...bossesReward].arrange();
    res.rewards = undefined;
    ctx.body = res;
}
