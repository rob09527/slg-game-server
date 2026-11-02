const updateRoleseat = require("../../../../../../model/role/instance/updateRoleseat");
const acquireLock = require("../../../../../../util/acquireLock");
const deleteLock = require("../../../../../../util/deleteLock");
const expireUserinfo = require("../../../../../../util/expireUserinfo");

//本地战斗结束汇报 
module.exports = exports = async function (ctx, next) {
    console.log("消息来到", ctx.role.rno)
    let { win } = ctx.request.body;

    const key = `${ctx.role._id.toString()}-prisoner`
    let result = await acquireLock(`${ctx.role.rno}-tianlao-claims`, 5000)
    ctx.assert(result, 'lock buy');
    var cacheInfo = await expireUserinfo(key, true)
    let additems = [];
    if (cacheInfo && cacheInfo.battle.claimstatus && win && cacheInfo.battle.time > Date.now()) {
        cacheInfo.battle.claimstatus = false
        // await global.dao.prisoner.updateOne({ _id: cacheInfo.battle.id }, { state: 4 })
        // await updateRoleseat(cacheInfo.battle.target, cacheInfo.battle.id, "delete")
        // ctx.role.addItemsNoSave({ gsid: cacheInfo.battle.gsid, count: 1 });
        // await ctx.role.save()
        const role = await global.dao.role.findOne({ _id: cacheInfo.battle.target });
        let info = []
        let key = []
        let win = false

        await Promise.all(cacheInfo.battle.itemInfo.map(async e => {
            if (e.state == 1) {
                info.push(e.gsid)
                key.push(e.id)
                win = true
                await global.dao.prisoner.updateOne({ _id: e.id }, { state: 4 })
                const rule = global.execrules[`gchip_${e.gsid + 10000}`];
                if (rule.FROM) {
                    additems.append(rule.FROM.map(t => ({
                        GSID: t.GSID || t.gsid, COUNT: (t.COUNT || t.count)
                    })));
                }
                let config = global.gameconfig.surrender.deepQueryOne('GSID', e.gsid);
                if (config.RATING > 5) {
                    ctx.role.bulletScreen("TIANLAO", role, e.gsid);
                }

            }
        }))
        ctx.role.addItemsNoSave(additems)

        await updateRoleseat(cacheInfo.battle.target, key, "deletelist")
        await global.dao.prisonerRecord.updateOne({ _id: cacheInfo.battle.recordId }, { info: info, win })
        console.log("数据写入", cacheInfo, win)

    } else if (!win) {
        cacheInfo.battle.claimstatus = false
    }
    //新人手册
    ctx.role.addItemsNoSave({ gsid: 94900, count: 1 })
    await ctx.role.save()

    await expireUserinfo(key, false, cacheInfo)
    await deleteLock(`${cacheInfo.battle.target}-tianlao-inprogress`)
    ctx.body = additems
}
