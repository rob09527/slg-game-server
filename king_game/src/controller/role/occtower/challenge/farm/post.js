
'use strict'
// 职业试炼-扫荡
const occtowerConfig = global.gameconfig.occtower.TOWERINFO;
module.exports = exports = async (ctx, next) => {
    // 可扫荡已通关的最高关卡
    let { type, time } = ctx.request.body;
    time = parseInt(time);
    ctx.assert(ctx.role.getItems(38011).count - time >= 0, 'no more');
    // 查玩家职业塔信息
    let towerInfo = await ctx.dao.tower.findOne({ rid: ctx.role._id, occu: type, type: 'occutower' }, { record: 1 });
    //没有记录说明没有挑战,先挑战
    ctx.assert(towerInfo, 'challenge first');
    let rewards = [];
    if (towerInfo) {
        let recordNum = towerInfo.record.length;
        let config = occtowerConfig[type][recordNum - 1];
        rewards = config.FARM_REWARDS.map(({ GSID, COUNT }) => {
            return {
                gsid: GSID,
                count: COUNT * time
            }
        });
        // 加
        ctx.role.addItemsNoSave(rewards);
        // 减
        ctx.role.castItemsNoSave({ gsid: 38011, count: time });
        await ctx.role.save();
    }
    ctx.body.rewards = rewards;
}