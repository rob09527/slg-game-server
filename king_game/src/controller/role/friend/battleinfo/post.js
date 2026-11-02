
'use strict'
// 好友阵容信息
module.exports = exports = async function (ctx, next) {

    let {friendid,battletype} = ctx.request.body;
    ctx.assert(friendid,'invalid friendid');
    ctx.assert(battletype,'invalid battletype');
    let role = await ctx.dao.role.findOne({_id:friendid});
    ctx.body =  await role.getBattleSet(battletype);
}