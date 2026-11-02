
'use strict'
// 手动更新玩家巅峰赛阵容
module.exports = exports = async (ctx, next) => {
    let {
        servid,
        uid,
        mode
    } = ctx.request.body;
    let role = await ctx.dao.role.findOne({ uid, servid })
    let list = [];
    for (let i = 1; i <= 3; i++) {
        if (!role.battlearr[`kingpvp${i}`]) continue;
        list.push(await role.getBattleSet(`kingpvp${i}`, mode));
    }
    ctx.body = list;
    if (list.length == 0) return;
    await ctx.dao.topking.findOne({ servid: servid, uid }, { $set: { c_battleset: list } });

}
