'use strict';

const operateSecretProps = require("../../../../../model/secretRealmRole/instance/operateSecretProps");
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

//解锁地图消耗
module.exports = async (ctx) => {
    const { mapid, level } = ctx.request.body;
    const secretRealmRole = await global.dao.secretRealmRole.findOne({ rid: ctx.role.rid });
    let key = `${mapid}-${level}`
    if (secretRealmRole.mapinfo.unlock[key]) {
        throw new Error(`The area has been unlocked:${key}`);
    }
    let config = global.gameconfig.secretRealmGz[2].find(e => e.MAPID == mapid && level == e.LEVEL)
    if (!config) {
        throw new Error(`error config unlocked:${key}`);
    }
    await operateSecretProps(ctx, config.item, "reduce")
    let insert = {}
    insert[`mapinfo.unlock.${key}`] = 1
    insert[`mapid`] = mapid > secretRealmRole.mapid ? mapid : secretRealmRole.mapid
    await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, { $set: insert });

    let taskconfig = global.gameconfig.secretRealmTask[0].find(e => e.TYPEPARAMS == key)

    if (taskconfig) {
        await secretTask(ctx, taskconfig.TASKTYPE, 1)
        console.log("地图解锁", key)
    }

    ctx.body = "success"
};
