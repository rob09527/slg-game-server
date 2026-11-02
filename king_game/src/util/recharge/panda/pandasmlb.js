'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index] = pid.split('_');
    let config = global.gameconfig.smzm['SMLB'];
    if(!config) throw new Error('miss SMLB config');
    let info = config[index];
    if(!info) throw new Error('miss SMLB info');

    let bought = role.panda.smzm.smlbrecord[index] || 0;
    role.panda.smzm.smlbrecord[index] = ++bought;

    role.addItemsNoSave({gsid: 38003, count: info.EXP});
    role.markModified("panda.smzm");

    return [ [...info.ITEMS, ...info.SPEC], info.PRICE, true ]
}