'use strict'

require('rx-apiwheel');

/**
 * 悬赏任务完成 并领奖
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    ctx.assert(ctx.mission.etime, 'not start');
    ctx.assert(Date.now() >= ctx.mission.etime, 'not finish');

    const {rewards, confirm} = ctx.dao.affairs.getRewards([ctx.mission], ctx.levelConfig, ctx.missionKey === 'missions' ? 0 : 1);

    
    if (ctx.missionKey === 'missions' && rewards.length > 0) {
        ctx.jobtask({mark: 90381, rid: ctx.role._id}).catch(console.error);
        // 完成标记
        let _conf = global.gameconfig.affairs.deepQueryOne('ID', ctx.mission.id);
        if (_conf) await ctx.role.missionInvoke('AFFAIRS_FINISH_SOLO', _conf.STAR);
    }
    // 删除完成了的任务
    ctx.affairs[ctx.missionKey] = ctx.affairs[ctx.missionKey].filter(item => item.mid !== ctx.missionid);
    const {bosses, upgrade, items} = await confirm(ctx.role);

    ctx.body = {
        reward: rewards,
        boss: bosses[0],
        items,
        upgrade
    };
}
