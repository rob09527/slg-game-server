'use strict'
const {ObjectId} = require("mongodb");

module.exports = exports = async (ctx, next) =>{
    ctx.team = await ctx.findTeam();
    ctx.rid = ctx.role.i();
    ctx.challengetime = 30 * 1000;
    let findError = async ()=>{
        if (!ctx.team) {
            return {ok:1, msg:"The team does not exist"}
        }
        else if (ctx.team.fellows.length < 2) {
            return {ok:2, msg:"Insufficient number of people"}
        }
        else if (Date.now() - ctx.team.challengetime <= ctx.challengetime) {
            if (ctx.team.challenge) {
                return {ok:3, msg:"challengeing no unlock "}
            }
            else if (ctx.team.challengerid != ctx.rid && ctx.team.challengerid != 0) {
                return {ok:4, msg:"challengeing " + ctx.team.challengerid + " " + ctx.rid}
            }
        }
        else if (ctx.type == 3) {
            let ticket = ctx.config.TICKET;
            let name = '';
            let count = 0;
            for (let {rid} of ctx.team.fellows) {
                count = 0;
                name = '';
                if (rid == ctx.rid) {
                    count = ctx.role.getProp(ticket);
                    name = ctx.role.name;
                }
                else {
                    let role = await ctx.dao.role.findOne({_id:ObjectId(rid)},{rname:1,rno:1,props:1});
                    if (role) {
                        count = role.getProp(ticket);
                        name = role.name;
                    }
                }
                if (count < ctx.config.COUNT) {
                    return {ok:5, msg:name}
                }
            }
        }
        return {ok:0, msg:""}
    }
    let error = await findError();
    if (error.ok > 0) {
        return ctx.body = {challenge:error.ok, msg:error.msg}
    }

    await next();
}