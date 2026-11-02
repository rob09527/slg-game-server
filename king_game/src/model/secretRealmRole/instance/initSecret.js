const addSpirit = require("../instance/addSpirit");
module.exports = async function (ctx) {
    let secretRealm = ctx.role.secretRealm
    let refersh = false
    if (!secretRealm?.csz) {
        csz = {
            //等级
            lv: 0,
            //记录属性加成信息
            pre: {},
            //记录解锁信息
            atpre: {}
        }
        ctx.role.secretRealm.csz = csz
        let insert = {}
        insert['secretRealm.csz'] = csz
        insert['secretRealm.spiritbreak'] = {}
        insert['secretRealm.spiritlevel'] = {}
        await ctx.role.updateOne({ $set: insert });
        refersh = true
    }

    if (refersh) {
        ctx.role = await ctx.dao.role.findOne({ _id: ctx.role.rid });
        ctx.role.rid = ctx.role.i()
    }
    if (!ctx.role.rid) {
        ctx.role.rid = ctx.role.i()
    }
    const secretRealmRole = await global.dao.secretRealmRole.findOne({ rid: ctx.role.rid });
    if (!secretRealmRole) {
        let mapconfig = global.gameconfig.secretRealmGz[6]
        let teleport = {}
        mapconfig.forEach(e => {
            if (e.MAPID && e.INDEX1 == "tp_1_1") {
                let key = `${e.MAPID}-${e.INDEX1}`
                teleport[key] = 1
            }
        });
        let insert = {
            items: {},
            mapid: global.gameconfig.secretRealmGz[1][0]['MAPID'],
            gis: {},
            mapinfo: { unlock: {}, teleport },
            boss: {},
            spirit: {},
            spiritLevel: 1,
            skillSequence: [],
            spiritLimitLevel: 50,
            attribute: {},
            spiritAttribute: {},
            gatherAttribute: {},
            gatherSpiritAttribute: {},
            task: {
                taskid: global.gameconfig.secretRealmTask[0][0].TASKID,
                count: 0,
                // global.gameconfig.secretRealmTask[0][0].COMPLETENUM
            },
            //占位
            spiritId: 91001,
        }

        await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, { $set: insert }, { upsert: true });
        await addSpirit(ctx.role.rid, 91001)
        ctx.secretRealmRole = await global.dao.secretRealmRole.findOne({ rid: ctx.role.rid });
    } else {
        ctx.secretRealmRole = secretRealmRole
    }
}