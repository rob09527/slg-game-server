'use strict'

const {ObjectId} = require("mongodb");

module.exports = exports = async (ctx, next) =>{
    let { index } = ctx.request.body;
    let config = ctx.config.VIP[index];
    let bought = 0;
    ctx.qxzl.record.forEach((value, idx)=>{
        bought += (idx <= index && value ? value : 0);
    })
    ctx.assert(config && bought < config.LIMIT,'110');

    ctx.qxzl.val += config.VAL;
    bought = ctx.qxzl.record[index] || 0;
    ctx.qxzl.record[index] = ++bought;
    ctx.qxzl.markModified("record");
    if (config.COUNT) {
        ctx.assert(ctx.role.getProp(config.GSID) >= config.COUNT && ctx.role.vip >= config.VIP,'111');
        ctx.role.castItemsNoSave({GSID:config.GSID, COUNT:config.COUNT});
        await ctx.role.save();
    }
    else {
        ctx.assert(ctx.role.vip >= config.VIP,'111');
    }
    await ctx.qxzl.save();
    ctx.body = {val:ctx.qxzl.val};

    
    let type = ctx.request.body.type;
    let teamword = type == 2 ? 'qxzlteamid' : "hideteamid";
    let id = ctx.role[teamword];
    id = id == 0 ? "" : id;
    if (type != 2 || ctx.qxzl.val <= 0 || !id) {
        return
    }
    let team = await ctx.dao.c_qxzlteam.findOne({_id: ObjectId(id)});
    if (!team) {return}
    let info = team.fellows.find(value=>value.rid == ctx.role.i());
    if (info && info.help) {
        info.help = false;
        team.markModified('fellows');
        await team.save();
    }
}