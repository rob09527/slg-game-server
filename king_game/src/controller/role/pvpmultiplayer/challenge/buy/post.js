
'use strict'

const getpvpinfo = require("../../../../../model/c_pvp_three/instance/getpvpinfo");

module.exports = exports = async (ctx, next) => {
    let item = { gsid: 38005, count: global.gameconfig.pvpmultiplayer[3][0]['PRICE'] }
    ctx.role.castItemsNoSave(item);
    let additem = { gsid: global.gameconfig.pvpmultiplayer[3][0]['id'], count: 1 }
    ctx.role.addItemsNoSave(additem);
    await ctx.role.save()
    ctx.body = 'success'
}
