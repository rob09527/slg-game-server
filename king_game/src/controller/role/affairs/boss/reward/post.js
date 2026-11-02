'use strict'

/**
 * 奖励领取
 * @author awko
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    ctx.assert(ctx.boss.killed === 1 && ctx.boss.reward, 'invalid boss');
    const rewardMap = ctx.boss.reward;
    const ownerId = ctx.role.i();
    ctx.assert(rewardMap[ownerId] && rewardMap[ownerId].length > 0, 'rewards empty');
    const rewards = rewardMap[ownerId].arrange();
    ctx.role.addItemsNoSave(rewards, {main: 'fboss killed', sec: 'mission'});
    ctx.body = {
        items: rewards
    }
    let up = {
        $unset: { [`reward.${ownerId}`]: ''},
        $set: {[`reward.${ownerId}-rec`]: rewardMap[ownerId]}
    };
    const r = await ctx.dao.fboss.updateOne({_id: ctx.boss._id},up );

    // 避免重复领取
    ctx.assert(r.nModified === 1, 'been received');

    await ctx.role.save();
    ctx.dao.fboss.findOne({_id:  ctx.boss._id}).then(boss => {
        // 领取完毕标记，提升boss查询效率
        let isRecFinish = true;
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
    });
}
