'use strict'
const {ObjectId} = require("mongodb");

module.exports = exports = async (ctx, next) =>{
    let { teamid, type } = ctx.request.body;
    let team1 = await ctx.dao.c_qxzlteam.findOne({_id: ObjectId(teamid), type});
    ctx.assert(team1, '116');
    let team2 = await ctx.findTeam();

    let error = {ok:true, msg:''};
    if (!team2) {
        error.ok = false, error.msg = '116';
    }
    else if (team1.type != team2.type) {
        error.ok = false, error.msg = '117';
    }
    else if (team2._id.toString() == team1._id.toString()) {
        error.ok = false, error.msg = '118';
    }
    else if (team1.pos != team2.pos) {
        error.ok = false, error.msg = '119';
    }
    else if (team1.level != team2.level) {
        error.ok = false, error.msg = '120';
    }
    else if (team1.pneed != team2.pneed) {
        error.ok = false, error.msg = '121';
    }
    else if (!team1.merge || team1.merge != team2.merge) {
        error.ok = false, error.msg = '122';
    }
    else if (team1.fellows.length + team2.fellows.length > 3) {
        error.ok = false, error.msg = '123';
    }
    ctx.assert(error.ok, error.msg);

    let arr = [...team2.fellows];

    team1.fellows.push(...team2.fellows);
    team1.markModified('fellows');
    await team1.save();
    await team2.remove();
    ctx.body = await team1.base();

    for (let {rid} of arr) {
        const role = await ctx.dao.role.findOne({_id:ObjectId(rid)});
        if (!role) continue;
        role[ctx.teamword] = team1.i();
        await role.save();
    }
}