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
        let index = ctx.role.panda.smzm.general.findIndex((info)=>{
            return info.gsid == gsid
        })
        if (index != -1) {
            arr.push(ctx.role.panda.smzm.general[index])
        }
        else {
            arr.push({gsid})
        }
    }
    ctx.role.panda.smzm.general = arr;
    ctx.role.markModified("panda.smzm");
    await ctx.role.save();
    ctx.body = {
        general: ctx.role.panda.smzm.general
    }
}