const _ = require('lodash');
//掉层  必须选奖励  重新激活
//升层  可选奖励 可不选
//归1  游戏结束 选奖励 1层奖励
//到顶  也意味游戏结束
//游戏开始 可以反复激活
module.exports = async function (ctx, pay, act) {
    let rid = ctx.role.rid
    let result = await global.dao.ssdbRole.findOne({ rid: rid })

    //激活需要的道具数量
    let item = { gsid: global.gameconfig.ssdb[0][0].GSID, count: global.gameconfig.ssdb[0][0].COUNT }

    if ((act && result.state == 0) || (act && !result)) {
        let layers = randomWeight(true)
        result = {
            layers: layers,
            try: 0,
            userlayers: layers,
            state: 1
        }

        ctx.role.castItemsNoSave(item);
        ctx.role.castItemsNoSave({ gsid: 99774, count: item.count });
        await ctx.role.save()
        await global.dao.ssdbRole.updateOne({ rid: rid }, { $set: result }, { upsert: true })
        return result
    }

    if (result.state != 1) {
        throw ('错误的游戏状态')
    }

    //获取当前层数的配置
    let config = global.gameconfig.ssdb[1].find(e => e.LAYERS == result.layers)
    if (!config) {
        throw ('错误的数据结构', result)
    }

    if (pay) {
        item.count = config.PAY
        ctx.role.castItemsNoSave(item);
        ctx.role.castItemsNoSave({ gsid: 99774, count: item.count });
        await ctx.role.save()
    }

    //拿一个层数
    let layers = randomWeight()
    //付费随机 保底为0
    if (pay && layers < 0) {
        result.try += 1
        if (result.try >= config.SUCCESS) {
            //补偿随机 重新分配
            result.try = 0
            layers = compensateRandomWeight()
            result.layers += layers
        }
    } else {
        //升级成功 保底重置 策划沟通过
        result.try = 0
        result.layers += layers
    }

    //监控游戏状态
    if (layers < 0 && !pay) {
        //掉层游戏结束
        result.state = 2
        if (result.layers <= 1) {
            result.layers = 1
        }
    } else if (result.layers >= global.gameconfig.ssdb[1][global.gameconfig.ssdb[1].length - 1].LAYERS) {
        result.layers = global.gameconfig.ssdb[1][global.gameconfig.ssdb[1].length - 1].LAYERS
        result.state = 2
    }

    let insert = {}
    insert['layers'] = result.layers
    insert['try'] = result.try
    insert['state'] = result.state
    await global.dao.ssdbRole.updateOne({ rid: rid }, { $set: insert })

    return { layers: layers, try: result.try, userlayers: result.layers }
}

/**
 * 是否付费
 * @param {*} pay 
 */
function randomWeight(first) {
    let randcount = _.random(0, 100)
    let syscount = 0
    let layers
    for (let x = 0; x < global.gameconfig.ssdb[2].length; x++) {
        let config = global.gameconfig.ssdb[2][x]
        if (!syscount) {
            syscount = first ? config.FIRSTW : config.NFIRSTW
        } else {
            syscount += first ? config.FIRSTW : config.NFIRSTW
        }
        if (randcount <= syscount) {
            layers = config.DRAWL
            break;
        }

    }
    if (!layers) {
        throw ("随机算法错误")
    }
    console.log(randcount, syscount, layers)
    return Number(layers)

}


/**
 * 补偿随机
 * @param {*} pay 
 */
function compensateRandomWeight() {
    let randSumCount = 0
    for (let x = 2; x < global.gameconfig.ssdb[2].length; x++) {
        let config = global.gameconfig.ssdb[2][x]
        randSumCount += config.NFIRSTW
    }
    let randcount = _.random(0, randSumCount)
    let syscount = 0
    let layers
    for (let x = 2; x < global.gameconfig.ssdb[2].length; x++) {
        let config = global.gameconfig.ssdb[2][x]
        if (!syscount) {
            syscount = config.NFIRSTW
        } else {
            syscount += config.NFIRSTW
        }
        if (randcount <= syscount) {
            layers = config.DRAWL
            break;
        }
    }
    if (!layers) {
        throw ("随机算法错误")
    }
    console.log("补偿随机", randcount, syscount, randSumCount, layers)
    return Number(layers)

}