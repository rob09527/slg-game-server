
'use strict'

module.exports = async ctx => {
    let {
        missionid,
    } = ctx.request.body;
    ctx.assert(ctx.zhenbao, 'not active');
    const config = global.gameconfig.zhenbao_mission[missionid];
    ctx.assert(config, 'invalid missionid');
    const {
        FINISH,
        FINISH_NUM,
        PROGRESS,
        PROGRESS_NUM,
        ZHENBAO_STRLV,
    } = config;
    // 是否已领取
    ctx.assert(ctx.role.getProp(FINISH) < FINISH_NUM, 'already finish');
    // 强化条件
    ctx.assert(ctx.zhenbao.slv >= ZHENBAO_STRLV, 'strlv nenough');
    // 进度条件
    ctx.assert(ctx.role.getProp(PROGRESS) >= PROGRESS_NUM, 'not yet');
    ctx.role.addItemsNoSave(FINISH);
    await ctx.role.save();
    ctx.body = {};
}