
'use strict'

module.exports = exports = async (ctx, next) => {
    // ctx.hook.pre(EVENT_ENUM.OCCTASK);
    ctx.occtask = ctx.role.occtask || {};
    //初始化
    if (Object.keys(ctx.occtask).length == 0) {
        let occtask = {};
        occtask.index = 0; // 任务步骤
        occtask.create = Date.now();
        occtask.giftpacks = {}; // 购买礼包信息
        occtask.occtype = 0; // 职业类别 0为未选择职业
        occtask.cachegiftid = 0; // 礼包信息中-刷新获得的礼包id
        occtask.refreshcount = 0; // 刷新礼包次数
        ctx.role.occtask = occtask;
        ctx.role.occtaskend = Date.now() + 3600 * 24 * 1000 * 30; // 职业任务结束时间(前端用)
        ctx.role.markModified('occtask');
        ctx.role.markModified('occtaskend');
        await ctx.role.save();
        ctx.role = await ctx.dao.role.findOne({ _id: ctx.role._id });
        ctx.occtask = ctx.role.occtask;
    }
    await next();
}
