'use strict'

const {ObjectId} = require("mongodb");

module.exports = exports = async (ctx, next)=>{
    let {rid} = ctx.request.body;
    ctx.assert(ctx.role.i() != rid, "no need speed");

    let boxInfo = ctx.config.BOX.find(doc =>{
        return doc.DROPID == 1007;
    })
    ctx.assert(boxInfo && boxInfo.HELP, "invalid boxInfo");

    let targetRole = await ctx.dao.role.findOne({_id:ObjectId(rid)});
    ctx.assert(targetRole,"target invalid");
    ctx.assert(targetRole.bless.speed && targetRole.bless.legion > 0, "9174");
    ctx.assert(targetRole.legion && targetRole.legion == ctx.role.legion,"9278");
    ctx.assert(targetRole.getProp(boxInfo.HELP.GSID) < boxInfo.HELP.COUNT, "9175");
    ctx.assert(targetRole.bless.help.includes(ctx.role.i()) == false, '9277');

    ctx.role.addItemsNoSave({GSID:boxInfo.HELP.HELPREWARD, COUNT:boxInfo.HELP.NUM});
    targetRole.addItemsNoSave({GSID:boxInfo.HELP.GSID, COUNT:1});
    targetRole.bless.legion -= boxInfo.HELP.TIME * 60000;
    if (targetRole.bless.legion < 0) {
        targetRole.bless.legion = 0;
    }
    targetRole.bless.help.push(ctx.role.i());
    targetRole.markModified("bless");
    
    let pro_arr = [];
    if (boxInfo.ACTIVE > 0) {
        let legion = await ctx.dao.legion.findOneAndUpdate({_id: ctx.role.legion},{$inc:{score:boxInfo.ACTIVE}}, {new:true});
        const {LEVEL, SCORE} = gameconfig.legionpvp.REQUIRE;
        if (legion.level >= LEVEL && legion.score >= SCORE && ctx.role._gameserv.groupstart < Date.now()){ // 报名军团战逻辑
    
            const MAX_AVA_TIMES = gameconfig.legionpvp.CONFIG.MAX_AVA_TIMES; // 单周最大匹配
            legion.pvpinfo = legion.pvpinfo || {};
            legion.pvpinfo.availableTimes = legion.pvpinfo.availableTimes || 0;
            console.log('inc legion  MAX_AVA_TIMES', legion.pvpinfo, MAX_AVA_TIMES);
            if (legion.pvpinfo.availableTimes < MAX_AVA_TIMES) {
                console.log('inc legion availableTimes')
                //$set['pvpinfo.availableTimes'] = legion.pvpinfo.availableTimes + MAX_AVA_TIMES; // 添加下周的门票（这里不用原子操作,避免同时签到发重
                //$set['pvpinfo.lastRegister'] = Date.now();
                legion.pvpinfo.availableTimes += MAX_AVA_TIMES; // 添加下周的门票（这里不用原子操作,避免同时签到发重
                legion.pvpinfo.lastRegister = Date.now();
                // 后面有save进行存储
            }
            pro_arr.push(legion.save());
        }
    }
    pro_arr.push(ctx.role.save(), targetRole.save());

    await Promise.all(pro_arr);
    ctx.body = {
        reward:[{GSID:boxInfo.HELP.HELPREWARD, COUNT:boxInfo.HELP.NUM}],
    };
}