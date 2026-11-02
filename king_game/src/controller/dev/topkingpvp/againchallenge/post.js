'use strict'
// 手动让玩家再战斗一遍
module.exports = exports = async (ctx, next) => {
    const {uid1 = "papa113321280", servid1 = 1038, uid2 = "papa113020840", servid2 = 1039} = ctx.request.body;
    ctx.body = await global.dao.topking.battle({uid: uid1, servid: servid1}, {uid: uid2, servid: servid2});
}
