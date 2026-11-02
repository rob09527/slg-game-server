
'use strict'
const moment = require('moment');

// 开始战斗
module.exports = exports = async (ctx, next) => {
    let { bossid } = ctx.request.body;
    const wbossconfig = global.gameconfig.legionwboss;
    const { END_DAY: wboss_end = 4 } = wbossconfig.CONFIG

    ctx.assert(bossid, 'invalid bossid');
    // 活动是否开启
    ctx.assert(moment().day() != wboss_end, 'no open');
    let canFightingNum = wbossconfig.FIGHTING_COST || [];
    canFightingNum = canFightingNum.length;
    // 是否有挑战次数
    ctx.assert(ctx.role.getItems(90389).count < canFightingNum, 'no challenge count');

    let battle = new ctx.dao.c_battle({
        rid: ctx.role._id,
        type: 'legionwboss',
        player: await ctx.role.getBattleSet('normal'),
        mark: bossid
    });

    // 战斗
    await battle.createEnemy(bossid).save();

    ctx.body =  battle.base()
}
