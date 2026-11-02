'use strict'

module.exports = exports = async (ctx, next) =>{
    let team = await ctx.findTeam();
    let rid = ctx.role.i();
    let pos = team && team.fellows.findIndex(value=> value.rid == rid);
    ctx.assert(pos > -1, '116');
    team.fellows.splice(pos,1);
    if (team.fellows.length == 0) {
        await team.remove();
    }
    else {
        team.markModified('fellows');
        await team.save();
    }

    ctx.body = {}

    ctx.role[ctx.teamword] = "";
    await ctx.role.save();
}