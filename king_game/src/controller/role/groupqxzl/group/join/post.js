'use strict'
const {ObjectId} = require("mongodb");

module.exports = exports = async (ctx, next) =>{
    let { id } = ctx.request.body;
    let rid = ctx.role.i();

    let qxzl = await ctx.dao.c_qxzl.findOne({rid, type:2});
    let team = await ctx.dao.c_qxzlteam.findOne({_id: ObjectId(id)});
    let error = {ok:true, msg:''};
    if (!team || !qxzl) {
        error.ok = false, error.msg = '116';
    }
    else if (team.fellows.length >= 3) {
        error.ok = false, error.msg = '123';
    }
    else if (qxzl.pos <= team.pos) {
        error.ok = false, error.msg = '104';
    }
    else if (ctx.role._power < team.pneed) {
        error.ok = false, error.msg = '105';
    }
    else if (ctx.role.level < team.level) {
        error.ok = false, error.msg = '106';
    }
    else if (team.fellows.findIndex(value=> value.rid == rid) > -1) {
        error.ok = false, error.msg = '107';
    }
    else if (ctx.type == 3 && ctx.role.getProp(ctx.config.TICKET) < ctx.config.COUNT) {
        error.ok = false, error.msg = '108';
    }
    ctx.assert(error.ok, error.msg);
    team.fellows.push({rid, help:ctx.type == 2 ? qxzl.val <= 0 : false});
    team.markModified('fellows');
    await team.save();

    let oldteam = await ctx.findTeam();
    if (oldteam) {
        let pos = oldteam.fellows.findIndex(value=> value.rid == rid);
        if (pos > -1) {
            oldteam.fellows.splice(pos,1);
            if (oldteam.fellows.length == 0) {
                await oldteam.remove();
            }
            else {
                oldteam.markModified('fellows');
                await oldteam.save();
            }
        }
    }

    ctx.role[ctx.teamword] = team.i();
    await ctx.role.save();
    ctx.body = await team.base();
}