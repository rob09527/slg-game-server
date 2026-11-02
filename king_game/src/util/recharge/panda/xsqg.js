"use strict"

module.exports = async function(role, pid) {
    const [_, index] = pid.split('_');

    let config = global.gameconfig.xsqg[index];
    if(!config) throw new Error('miss xsqg config index:',index);
    let bought = role.xsqg[index] || 0;
    if (bought >= config.limit) throw new Error('already buy index:',index);

    role.xsqg[index] = ++bought;
    role.markModified('xsqg');

    role.addItemsNoSave({gsid: 38003, count: config.EXP});

    return [config.ITEMS,config.PRICE,true];
}