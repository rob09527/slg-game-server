'use strict'

module.exports = exports = async (ctx, next) =>{
    ctx.assert(ctx.type == 2, '124');
    let team = await ctx.findTeam();
    let rid = ctx.role.i();
    let pos = team ? team.fellows.findIndex(value=> value.rid == rid) : -1;
    ctx.assert(pos > -1, '116');
    let obj = team.fellows[pos];
    if (obj.help) {
        let qxzl = await ctx.dao.c_qxzl.findOne({rid, type:2});
        ctx.assert(qxzl,'125');
        if (qxzl.val <= 0) {
            return ctx.body = {status:1}
        }
    }
    obj.help = !obj.help;
    team.markModified('fellows');
    await team.save();
    ctx.body = {
        team: await team.base(),
        status:0
    };
}