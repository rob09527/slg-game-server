'use strict';

const { CONFIG } = global.gameconfig.ring_rank;
module.exports = exports = async ctx => {
    const {
        battleid,
    } = ctx.request.body;

    const fee_count = CONFIG.FREE_MARK ? ctx.role.getProp(CONFIG.FREE_MARK) : 0;
    if (fee_count) {
        ctx.role.castItemsNoSave({
            GSID: +CONFIG.FREE_MARK,
            COUNT: 1
        });
    } else {
        // 没有免费次数消耗演武令
        ctx.role.castItemsNoSave({ gsid: 30028, count: CONFIG.CAST_COUNT || 2 });
    }

    ctx.body = {};
    // 战斗计算
    const battle = await ctx.dao.c_battle.findOne({ _id: battleid });
    ctx.assert(battle, 'invalid battleid');
    const {
        videolist,
        version,
    } = await battle.calmulti();

    let r = await ctx.dao.ringrank.challengeFinish({
        left: { rid: battle.player.rid, servid: battle.player.servid },
        right: { rid: battle.enemy.rid, servid: battle.enemy.servid },
        videolist,
        version,
        ret: battle.result.ret
    });

    ctx.body = r.toObject();
    ctx.body.resultlist = videolist;
    // 翻牌
    ctx.body.reward = ctx.role.pvpFanPai('ring');
    await ctx.role.save();
    ctx.role.dispatchEvent('EVENT_RING_PVP', 1, {ret:battle.result.ret});
};
