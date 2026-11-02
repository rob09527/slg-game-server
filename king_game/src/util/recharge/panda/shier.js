'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index] = pid.split('_');
    let config = global.gameconfig.shier[index];
    if(!config) throw new Error('miss shier config:',file," index:",index);

    if(role.shier) { // 异步跨天购买时，数据可能被清空了，买的时昨天的数据
        role.shier.buytime++;
        role.markModified('shier');
    }

    role.addItemsNoSave({gsid: 38003, count: config.EXP});

    return [config.ITEMS,config.PRICE,true]
}
    