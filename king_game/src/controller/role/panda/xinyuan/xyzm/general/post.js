"use strict"

module.exports = exports = async function (ctx, next) {
    let {
        general = []
    } = ctx.request.body

    general = new Set(general);
    general = [...general];

    let gsid = general.filter((gsid)=>{
        return ctx.config.GENERAL[gsid]
    })

    ctx.assert(gsid.length == 4, "general not enough")

    let arr = [];
    for (let gsid of general) {
        let index = ctx.role.panda.xyzm.general.findIndex((info)=>{
            return info.gsid == gsid
        })
        if (index != -1) {
            arr.push(ctx.role.panda.xyzm.general[index])
        }
        else {
            arr.push({gsid})
        }
    }
    ctx.role.panda.xyzm.general = arr;
    ctx.role.markModified("panda.xyzm");
    await ctx.role.save();
    ctx.body = {
        general: ctx.role.panda.xyzm.general
    }
}