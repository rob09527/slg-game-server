const acquireLock = require("../../../util/acquireLock");
/**
 * 操作木材等特殊秘境限制道具
 * @param {*} ctx 
 * @param {*} roleitems 
 * @param {*} type 
 * @returns 
 */
module.exports = async function (ctx, roleitems, type) {
    let items = JSON.parse(JSON.stringify(roleitems))
    let result = await acquireLock(`${ctx.role.rid}-operateSecretProps`, 500)
    if (!result) {
        throw new Error('lock operateSecretProps');
    }
    // 根据type执行相应的操作
    if (type === 'reduce') {
        ctx.role.castItemsNoSave(items);
    } else if (type === 'add') {
        //后期如果需要做限制可以打开
        // let resuslt = global.gameconfig.secretRealmGz[1].find(e => e.MAPID == ctx.secretRealmRole.mapid)
        // if (!resuslt) {
        //     throw new Error('mapid not found');
        // }
        // let configitem = resuslt.item
        // for (let x = 0; x < items.length; x++) {
        //     let item = items[x]
        //     let checkitem = configitem.find(e => e.gsid == item.gsid)
        //     if (checkitem) {
        //         let roleitems = {}
        //         let nowcount = ctx.role.getItems(item.gsid).count
        //         roleitems[item.gsid] = (nowcount || 0) + item.count;
        //         if (checkitem.count <= roleitems[item.gsid]) {
        //             let count = checkitem.count - nowcount
        //             item.count = count < 0 ? 0 : count
        //         }
        //     }
        // }
        ctx.role.addItemsNoSave(items);
    }
    await ctx.role.save();
    return true
};


