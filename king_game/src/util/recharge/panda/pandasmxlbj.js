'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index] = pid.split('_');
    let config = global.gameconfig.smzm['XLBJ'];
    if(!config) throw new Error('miss SMXLBJ config');
    let info = config[index];
    if(!info) throw new Error('miss SMXLBJ info');

    let record = role.panda.smzm.xlbjrecord[index] || {buy:0, got:0};
    let bought = record.buy;
    record.buy = ++bought;
    record.got = Date.now();
    role.panda.smzm.xlbjrecord[index] = record
    if (info.EXP) {
        role.addItemsNoSave({gsid: 38003, count: info.EXP});
    }
    role.markModified("panda.smzm");

    return [ info.ITEMS, info.PRICE, true ]
}