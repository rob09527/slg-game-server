/**
 * 更新装备的宠物
 * @param {*} ctx 
 * @param {*} id 
 * @returns 
 */
module.exports = async function (ctx, id) {
    const secretRealmRole = await global.dao.secretRealmRole.findOne({ rid: ctx.role.rid });
    if (!secretRealmRole.spirit[id]) {
        throw new Error(`updatespirit error spirit id ${id},`);
    }

    let config = global.gameconfig.secretRealmjl[3].find(e => e.ID == id)
    if (!config) {
        throw new Error(`updatespirit error spirit quality ${id},`);
    }
    // let limit = spiritpj.LIMIT
    // let level = spiritpj.LIMIT
    // if (secretRealmRole.spiritLevel < limit) {
    //     level = secretRealmRole.spiritLevel
    // }

    // let list = []
    // global.gameconfig.secretRealmjl[2].forEach(e => {
    //     if (e.LEVEL <= level) {
    //         list.push(e)
    //     }
    // });

    let spiritAttribute = {}
    // let gatherSpiritAttribute = {}
    // list.forEach(e => {
    config.ATT ? spiritAttribute[config.ATT] = config.A_COUNT_0 : 1
    config.ATT1 ? spiritAttribute[config.ATT1] = config.A_COUNT_1 : 1

    //     spiritlevel[e.ATT] = (spiritlevel[e.ATT] || 0) + e.M_ATT_0
    //     spiritlevel[e.ATT1] = (spiritlevel[e.ATT1] || 0) + e.M_ATT_1
    //策划修改本配置
    // gatherSpiritAttribute['wood'] = (gatherSpiritAttribute['wood'] || 0) + e.SPEED1
    // gatherSpiritAttribute['ore'] = (gatherSpiritAttribute['ore'] || 0) + e.SPEED2

    // })

    let insert = {}
    insert['spiritAttribute'] = spiritAttribute
    // insert['gatherSpiritAttribute'] = gatherSpiritAttribute
    insert['spiritId'] = id
    insert['skillSequence'] = []
    await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, { $set: insert });

    return true
}