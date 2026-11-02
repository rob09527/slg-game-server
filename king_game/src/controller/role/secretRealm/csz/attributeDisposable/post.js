'use strict';

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");


module.exports = exports = async (ctx) => {
    let secretRealm = ctx.role.secretRealm
    let csz = secretRealm.csz
    let insert = {}
    let count = 0
    while (true) {
        csz.lv += 1
        let config = global.gameconfig.secretRealm[1].find(e => e.LEVEL == csz.lv)
        if (!config) {
            break;
        } else {
            try {
                let atpre = csz.atpre
                if (config.UNLOCK && !atpre[config.UNLOCK]) {
                    break
                }
                ctx.role.castItemsNoSave(config.item);
                csz.pre[config.ATT] ? csz.pre[config.ATT] += config['A_COUNT_1'] : csz.pre[config.ATT] = config['A_COUNT_1']
                insert['secretRealm.csz'] = csz
                count += 1
            } catch (error) {
                console.log('道具不足停止升级')
                break;
            }
        }
    }
    //秘境主线任务打点
    await secretTask(ctx, 99554, count)
    await ctx.role.save()
    await ctx.role.updateOne({ $set: insert });
    //秘境主线任务打点
    await secretTask(ctx, 99554, 1)

    ctx.body = {
        level: csz.lv
    }
};



