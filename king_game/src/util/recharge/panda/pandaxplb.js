'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index, id] = pid.split('_');
    let config = global.gameconfig[`xplb${id}`];
    if(!config) throw new Error('miss xplb config');
    let info = config[index];
    if(!info) throw new Error('miss xplb info');

    let bought = role.panda.xplb.record[index] || 0;
    role.panda.xplb.record[index] = ++bought;

    role.addItemsNoSave({gsid: 38003, count: info.EXP});
    role.markModified("panda.xplb");

    return [ info.REWARDS, info.PRICE, true ]
}