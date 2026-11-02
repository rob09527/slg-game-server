'use strict';

const operateSecretProps = require("../../../../../model/secretRealmRole/instance/operateSecretProps");
const secretSpirit = require("../../../../../model/secretRealmRole/instance/secretSpirit");
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");
/**
 * 采集接口
 * @param {*} ctx 
 */
module.exports = async (ctx) => {
    // 从请求体中解构出 id 和 list//对应配置表index 1 2 3 4 5 
    const { list } = ctx.request.body;
    // 查找对应的配置（这里假设 global.gameconfig.secretRealmGz[0] 是一个数组）
    // const secretRealmRole = ctx.secretRealmRole
    // let initwood = global.gameconfig.secretRealmjl[4][0].SPEED1 / 1000
    // let initore = global.gameconfig.secretRealmjl[4][0].SPEED2 / 1000
    let items = []
    let record = { gsid: 99702, count: 0 }
    for (let x = 0; x < list.length; x++) {
        //前端数据结构
        const { num, type } = list[x]
        record.count += num
        if (num <= 0) {
            console.log(type, num)
            continue;
        }
        // const result = global.gameconfig.secretRealmGz[0].find(e => String(e.LEVEL_ARR).split(',').find(c => c == id));
        // if (!result) {
        //     throw new Error(`No configuration found for ID: ${id}`);
        // }
        // let wood = ((secretRealmRole.gatherAttribute.wood || 0) + (secretRealmRole.gatherSpiritAttribute.wood || 0)) / 1000
        // let ore = ((secretRealmRole.gatherAttribute.ore || 0) + (secretRealmRole.gatherSpiritAttribute.ore || 0)) / 1000
        // wood += initwood
        // ore += initore
        if (type == 1) {
            //矿石
            let item = {
                gsid: 38028,
                count: num
            }
            // let oremax = Math.floor(ore * time)
            // if (oremax > result.ORENUM) {
            //     item.count = result.ORENUM
            // } else {
            //     item.count = oremax
            // }
            items.push(item)
            //秘境主线任务打点
            await secretTask(ctx, 99537, num)
        } else if (type == 2) {
            //树
            let item = {
                gsid: 38026,
                count: num
            }
            // let woodmax = Math.floor(wood * time)
            // if (woodmax > result.TREENUM) {
            //     item.count = result.TREENUM
            // } else {
            //     item.count = woodmax
            // }
            await secretTask(ctx, 99538, num)
            items.push(item)
        } else if (type == 3) {
            //肉
            let item = {
                gsid: 38027,
                count: num
            }
            // let woodmax = Math.floor(wood * time)
            // if (woodmax > result.TREENUM) {
            //     item.count = result.TREENUM
            // } else {
            //     item.count = woodmax
            // }
            items.push(item)
        }
    }
    let data = [record, ...items]
    await operateSecretProps(ctx, [record, ...items], "add")
    await secretSpirit(ctx)

    const secretRealmRole = ctx.secretRealmRole

    ctx.body = {
        items,
        task: secretRealmRole.task
    };
};
