
'use strict'
// 根据rid获取阵容信息
module.exports = exports = async function (ctx, next) {

    let { rid, battletype } = ctx.request.body;
    ctx.assert(rid, 'invalid rid');
    ctx.assert(battletype, 'invalid battletype');
    let role = await ctx.dao.role.findOne({ _id: friendid });
    ctx.assert(role, 'no role');
    if (battletype.startsWith('wangpvp')) {
        let batllearr = [];
        for (let i = 1; i <= 3; i++) {
            let bset = await role.getBattleSet(`wangpvp${i}`);
            if (Object.keys(team).length == 0) continue;
            batllearr.push(bset);
        };
        ctx.body = batllearr;
        return;
    }
    ctx.body = await role.getBattleSet(battletype);
}