'use strict'

module.exports = exports = async (ctx, next) =>{
    let team = await ctx.findTeam();
    ctx.assert(!team && (ctx.type == 2 || ctx.role.getProp(ctx.config.TICKET) >= ctx.config.COUNT),'108');

    let { name, pos, level, pneed, merge } = ctx.request.body;
    let qxzl = await ctx.dao.c_qxzl.findOne({rid:ctx.role.i(), type:2});
    let error = {ok:true, msg:''};
    if (!qxzl) {
        error.ok = false, error.msg = '125';
    }
    else if (qxzl.pos <= pos) {
        error.ok = false, error.msg = '104';
    }
    else if (ctx.role.level + 10 < level) {
        error.ok = false, error.msg = '106';
    }
    ctx.assert(error.ok,error.msg);
    team = new ctx.dao.c_qxzlteam({ servid:ctx.role.servid, name, pos, level, pneed, merge, type:ctx.type });
    team.fellows.push({rid:ctx.role.i(), help:ctx.type == 2 ? qxzl.val <= 0 : false});
    team.markModified("fellows");
    await team.save();

    ctx.body = await team.base();
    
	ctx.role[ctx.teamword] = team.i();
	await ctx.role.save();
}