'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index] = pid.split('_');
    let config = global.gameconfig.xyzm['XYLB'];
    if(!config) throw new Error('miss XYLB config');
    let info = config[index];
    if(!info) throw new Error('miss XYLB info');

    let bought = role.panda.xyzm.xylbrecord[index] || 0;
    role.panda.xyzm.xylbrecord[index] = ++bought;

    role.addItemsNoSave({gsid: 38003, count: info.EXP});
    role.markModified("panda.xyzm");

    return [ [...info.ITEMS, ...info.SPEC], info.PRICE, true ]
}