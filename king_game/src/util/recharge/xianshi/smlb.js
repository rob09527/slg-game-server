'use strict'

module.exports = exports = async function (role, pid) {
    const [_, mode, index] = pid.split('_');
    let config = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    if(!config) throw new Error('miss xianshi smlb zhd_newhero');
    config = config["SMLB"];
    if(!config) throw new Error('miss xianshi smlb config');
    let info = config[index];
    if(!info) throw new Error('miss xianshi smlb info');
    
    let record = role[mode].smlbrecord[index] || {buy:0};
    let bought = record.buy;
    record.buy = ++bought;
    record.got = Date.now();
    role[mode].smlbrecord[index] = record

    role.addItemsNoSave({gsid: 38003, count: info.EXP});
    role.markModified(mode);

    return [ info.ITEMS, info.PRICE, true ]
}