'use strict';

const operateSecretProps = require("../../../../../model/secretRealmRole/instance/operateSecretProps");
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

//解锁地图消耗
//99663
module.exports = async (ctx) => {
    const { mapid, index } = ctx.request.body;
    const secretRealmRole = await global.dao.secretRealmRole.findOne({ rid: ctx.role.rid });
    let key = `${mapid}-${index}`
    if (secretRealmRole.mapinfo.teleport && secretRealmRole.mapinfo.teleport[key]) {
        throw new Error(`The area has been unlocked:${key}`);
    }
    let item = []
    let config = global.gameconfig.secretRealmGz[6].map(e => {
        for (let x = 1; x < 6; x++) {
            if (e.MAPID == mapid && e[`INDEX${x}`] == index) {
                item = e.item[x - 1]
            }
        }
    })
    if (!config) {
        throw new Error(`error config unlocked:${key}`);
    }
    await operateSecretProps(ctx, item, "reduce")
    let insert = {}
    insert[`mapinfo.teleport.${key}`] = 1
    await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, { $set: insert });

    let taskconfig = global.gameconfig.secretRealmTask[0].find(e => e.TYPEPARAMS == key)
    if (taskconfig) {
        await secretTask(ctx, taskconfig.TASKTYPE, 1)
        console.log("传送点解锁", key)
    }

    ctx.body = "success"
};
