'use strict'

const cursor = require("../../../../../util/cursor");

module.exports = exports = async (ctx, next)=>{
    ctx.assert(ctx.role.legion, 'not join legion');
    let boxInfo = ctx.config.BOX.find(doc =>{
        return doc.DROPID == 1007;
    })
    ctx.assert(boxInfo && boxInfo.HELP, "invalid boxInfo");
    let now = Date.now() - boxInfo.TIME * 60000;
    let obj = {
        legion:ctx.role.legion,
        "bless.speed":1,
        "bless.legion":{$gt:now},
    }
    let show = {rname:1, rno:1, bless:1}
    show["others."+boxInfo.HELP.GSID+".count"] = 1;
    ctx.body = [];
    let rid = ctx.role.i();
    await cursor(ctx.dao.role.find(obj, show), async(role)=>{
        ctx.body.push({name:role.name, rid:role._id, allCount: boxInfo.HELP.COUNT, process:role.bless.help.length, help:role.bless.help.includes(rid) == false && role.getProp(boxInfo.HELP.GSID) < boxInfo.HELP.COUNT});
    });
}