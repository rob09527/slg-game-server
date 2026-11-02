'use strict';
const _ = require('lodash');
const operateSecretProps = require("../../../../../model/secretRealmRole/instance/operateSecretProps");
//打怪
module.exports = async (ctx) => {
    // 从请求体中解构出 id 和 list//对应配置表index 1 2 3 4 5 
    // const { map, level, list } = ctx.request.body;
    let elshop = global.ACTIVITY['elshop'];
    let shopitem = { gsid: 38031, count: 0 }
    const { map, fusion } = ctx.request.body;
    // 创建一个空数组来存储匹配的 items
    const items = [];
    //日常任务记录
    let record = { gsid: 99701, count: 0 }
    for (let x = 0; x < fusion.length; x++) {
        // 检查 id 和 list 是否有效
        let level = fusion[x].level
        let list = fusion[x].list
        if (!Array.isArray(list)) {
            throw new Error('Invalid input: id must be a number and list must be an array.');
        }
        // 查找对应的配置（这里假设 global.gameconfig.secretRealmGz[0] 是一个数组）
        const result = global.gameconfig.secretRealmGz[0].find(e => (e.MAPID == map && e.LEVEL == level));
        if (!result) {
            throw new Error(`No configuration found for map: ${map},level: ${level}`);
        }
        record.count += list.length
        // 遍历 list，检查每个元素是否存在于 result.item 中
        list.forEach(itemId => {

            if (elshop.start < Date.now() && elshop.etime > Date.now() && _.random(0, 100) >= 50) {
                shopitem.count += 1
            }
            if (result.item && result.item[itemId]) {
                items.push(...result.item[itemId]);
            } else {
                throw new Error(`Item with ID: ${itemId} not found in configuration for map: ${map},level: ${level}`);
            }
        });
    }

    let checkcount = ctx.role.getItems(99735).count
    if (shopitem.count > 0 && checkcount < global.gameconfig.ssdb[8][0].COUNT) {
        items.push(shopitem)
        items.push({ gsid: 99735, count: shopitem.count })
    }

    await operateSecretProps(ctx, [record, ...items], "add")

    ctx.body = {
        items
    };
};
