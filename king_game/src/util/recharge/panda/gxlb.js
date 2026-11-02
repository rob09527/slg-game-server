'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index, id] = pid.split('_');
    let file = "panda_gxlb"+id;
    let config = global.gameconfig[file][index];
    if(!config) throw new Error('miss gxlb config:',file," index:",index);

    let data = role.panda.gxlb;
    data.lock[config.PRICE] = 0;
    if (config.LIMIT > 0){
        data.limit[config.PRICE] = (data.limit[config.PRICE] || 0) + 1;
    }
    role.markModified('panda');

    role.addItemsNoSave({gsid: 38003, count: config.EXP});

    return [config.ITEMS,config.PRICE,true]
}
    