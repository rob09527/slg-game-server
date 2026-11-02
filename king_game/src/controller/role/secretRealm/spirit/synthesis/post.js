'use strict';


const addSpirit = require("../../../../../model/secretRealmRole/instance/addSpirit");


//精灵合成
module.exports = async (ctx) => {
    let { id } = ctx.request.body;
    const secretRealmRole = ctx.secretRealmRole

    let config = global.gameconfig.secretRealmjl[4].find(e => e.GSID == id)
    if (!config) {
        throw new Error(`error config ${id}`);
    }

    let spirit = secretRealmRole.spirit[config.ID]
    if (spirit) {
        throw new Error('The spirit already exists');
    }
    let items = {
        gsid: config.GSID,
        count: config.CHIP
    }
    ctx.role.castItemsNoSave(items);
    await ctx.role.save();
    await addSpirit(ctx.role.rid, config.ID)
    ctx.body = "success"
};
