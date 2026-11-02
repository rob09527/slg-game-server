
'use strict'

const initSecret = require("../../../../../../model/secretRealmRole/instance/initSecret");

module.exports = exports = async function (ctx, next) {
    let {
        id
    } = ctx.request.body;

    let config = global.gameconfig.surrenderseat[0].find(e => e.ID == id)

    ctx.assert(config, 'config error');

    ctx.assert(ctx.role.seat[id] == undefined, 'Repeated unlocking');

    let doEx = 0;
    switch (config.UNLOCKTYPE) {
        //角色等级
        case 1: {
            ctx.role.level >= config.LEVEL ? doEx = 1 : 1; break;
        };
        //精灵等级
        case 2: {
            await initSecret(ctx);
            ctx.secretRealmRole.spiritLevel >= config.LEVEL ? doEx = 1 : 1;
            break;
        };
        //vip等级
        case 3: {
            ctx.role.vip >= config.LEVEL ? doEx = 1 : 1;
            break;
        };
    }
    console.log("解锁信息", config,)
    if (doEx) {
        ctx.role.castItemsNoSave(config.item);
        await ctx.role.save()
        let update = {}
        update[`seat.${id}`] = false
        let client = ctx.role.seat
        client[id] = false
        await ctx.role.updateOne({ $set: update });
        ctx.body = client
    } else {
        ctx.assert(false, 'Not meeting the execution conditions');
    }
}
