'use strict';

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");


module.exports = exports = async (ctx) => {
    let secretRealm = ctx.role.secretRealm
    let csz = secretRealm.csz
    csz.lv += 1
    let config = global.gameconfig.secretRealm[1].find(e => e.LEVEL == csz.lv)
    ctx.assert(config, 'invalid config secretRealm');

    let atpre = csz.atpre
    if (config.UNLOCK && !atpre[config.UNLOCK]) {
        throw ('Not meeting the conditions')
    }

    ctx.role.castItemsNoSave(config.item);
    await ctx.role.save()
    csz.pre[config.ATT] ? csz.pre[config.ATT] += config['A_COUNT_1'] : csz.pre[config.ATT] = config['A_COUNT_1']
    let insert = {}
    insert['secretRealm.csz'] = csz
    await ctx.role.updateOne({ $set: insert });
    //秘境主线任务打点
    await secretTask(ctx, 99554, 1)

    ctx.body = 'success'
};
