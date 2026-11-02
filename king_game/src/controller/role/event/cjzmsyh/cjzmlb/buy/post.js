"use strict"

const acquireLock = require("../../../../../../util/acquireLock");

module.exports = async function (ctx, next) {
    let { index, platform, bundle, channel, version } = ctx.request.body;
    index = parseInt(index);
    console.log("cjzmlb", index)
    let config = global.gameconfig.cjzmsyh[1]
    ctx.assert(index < config.length && index >= 0, "index error");
    let mark = config[index]['MARK']
    ctx.assert(config[index]['LIMIT'] > ctx.role.getItems(mark).count, "buytime limit");
    let result = await acquireLock(`${ctx.role.rno}-cjzmlb`, 5000)
    ctx.assert(result, 'lock buy');

    await ctx.role.save();
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ["cjzmlb", index].join("_"),
        price: config[index].PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}