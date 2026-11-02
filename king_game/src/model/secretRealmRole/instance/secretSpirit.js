/**
 * 装填秘境道具信息
 * @param {*} ctx 
 */
module.exports = function (ctx) {
    let result = ctx.secretRealmRole
    let spirit = result.spirit


    let nextconfig = global.gameconfig.secretRealmTask[0].find(e => e.TASKID == result.task.taskid)
    if (nextconfig) {
        let count = ctx.role.getItems(nextconfig.TASKTYPE).count;
        result.task.count = count
    }


    //装填精灵秘境属性
    // for (let x in spirit) {
    //     let data = global.gameconfig.secretRealmjl[3].find(e => e.ID == x)
    //     let newData = {};
    //     for (let key in data) {
    //         if (data.hasOwnProperty(key)) {
    //             newData[key.toLowerCase()] = data[key];
    //         }
    //     }
    //     spirit[x] = { ...spirit[x], ...newData }
    //     for (let value in result.attribute) {
    //         spirit[x][value] = (spirit[x][value] || 0) + result.attribute[value]

    //     }

    //     for (let value2 in result.spiritAttribute) {
    //         spirit[x][value2] = (spirit[x][value2] || 0) + result.spiritAttribute[value2]
    //     }
    // }
    //装填采集属性
    let gather = {}
    // for (let x in result.gatherAttribute) {
    //     gather[x] = (gather[x] || 0) + result.gatherAttribute[x]
    // }

    // for (let x in result.gatherSpiritAttribute) {
    //     gather[x] = (gather[x] || 0) + result.gatherSpiritAttribute[x]
    // }
    result.gather = gather
    // let panel = spiritclientAll(ctx)
    let panel = {}
    let data = { ...result._doc, gather, panel }

    return data
}

/**
 * 提供给前端的面板属性加成
 */
function spiritclientAll(ctx) {
    let secretRealmRole = ctx.secretRealmRole
    let spirit = secretRealmRole.spirit
    let spiritId = secretRealmRole.spiritId
    let spiritLevel = secretRealmRole.spiritLevel
    //精灵升级属性汇总
    let spiritAttribute = secretRealmRole.spiritAttribute
    //精灵突破属性汇总
    let attribute = secretRealmRole.spiritAttribute

    //采集固定属性(突破秘诀属性加成)
    let gatherAttribute = secretRealmRole.gatherAttribute
    //采集根据精灵动态变化数据(升级秘诀属性加成)
    let gatherSpiritAttribute = secretRealmRole.gatherSpiritAttribute


    //当前宠物的初始化页面
    let spiritInitConfig = global.gameconfig.secretRealmjl[3].find(e => e.ID == spiritId)

    // 攻击=（精灵当前等级属性累加＋初始攻击＋精灵攻击成长*（精灵等级-1））* （1+所有己激活星级百分比攻击加成）
    //（精灵当前等级属性累加＋初始攻击＋精灵攻击成长*（精灵等级-1））
    let atk = (spiritAttribute['atk'] ?? 0 + spiritInitConfig['ATK'] + spiritInitConfig['GATK'] * (spiritLevel - 1)) * (1 + attribute['atk'] ?? 0)

    //血量=（精灵当前等级属性累加＋初始血量＋精灵血量成长*（精灵等级-1））*（1+所有已激活星级百分比血量加成）
    let hp = (spiritAttribute['hp'] ?? 0 + spiritInitConfig['HP'] + spiritInitConfig['GHP'] * (spiritLevel - 1)) * (1 + attribute['hp'] ?? 0)
    // 攻击百分比 总百分比=所有己激活星级百分比
    let patk = attribute['patk'] ?? 0
    //血量百分比 总百分比=所有己激活星级百分比
    let php = attribute['php'] ?? 0
    //石头总采集速度=精灵初始采集速度
    let ore = spiritInitConfig['SPEED']
    //木材总采集速度=精灵初始采集速度
    let wood = spiritInitConfig['SPEED']
    //秘境精灵面板填充
    let spiritPanel = {
        atk,
        hp,
        patk,
        php,
        ore,
        wood
    }

    //战斗面板填充
    let battlePanel = {}
    let spiritbreak = ctx.role.secretRealm.spiritbreak ?? {}
    let spiritlevel = ctx.role.secretRealm.spiritlevel ?? {}
    for (let x in spiritbreak) {
        battlePanel[x] = spiritbreak[x]

    }
    for (let x in spiritlevel) {
        if (battlePanel[x]) {
            battlePanel[x] += spiritlevel[x]
        } else {
            battlePanel[x] = spiritlevel[x]
        }

    }
    let panel = {
        spiritPanel,
        battlePanel

    }

    return panel




}    