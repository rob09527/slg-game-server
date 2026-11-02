
'use strict'
// 指挥官转移
module.exports = exports = async (ctx, next) => {
    let { changerid } = ctx.request.body;
    ctx.assert(changerid, 'no changerid');
    // 判断权限
    ctx.assert(ctx.nationwarInfo.rid == ctx.role._id, 'no allowed');
    // 转移后的rid是否存在
    let role = await ctx.dao.role.findOne({ _id: changerid }, { uid: 1, servid: 1, hide: 1 });
    ctx.assert(role, 'no role info');
    // 转移后的rid是否达到等级？
    const luckConfig = global.gameconfig.function_luck['NATION_RING'];
    if (luckConfig) ctx.assert(role.getProp(luckConfig.REQUIRE_NAME) >= luckConfig.REQUIRE_COUNT, 'invalid target level');
    ctx.nationwarInfo.rid = role._id;
    ctx.nationwarInfo.update = Date.now();
    ctx.nationwarInfo.markModified('rid');
    await ctx.nationwarInfo.save();
    //  通知转移后的玩家
    global.pushClient(role._id, {
        type: 'nationwar', // 国战
        content: { 'refresh_leader': 1 }
    });

    ctx.body = {};
}