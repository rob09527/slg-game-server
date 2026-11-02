'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index] = pid.split('_');
    let config = global.gameconfig.sppackdayly[index];
    if(!config) throw new Error('miss daygift config index:',index);
    let bought = role.daygift[index] || 0;
    if (bought >= config.limit) throw new Error('already buy index:',index);

    role.daygift[index] = ++bought;
    role.markModified('daygift');

    role.addItemsNoSave({gsid: 38003, count: config.VIPEXP});
    role.addItemsNoSave({gsid: 38001, count: config.EXP});

    return [config.ITEMS,config.PRICE,true];
}