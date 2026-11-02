'use strict'

module.exports = exports = async function (role, pid) {
    const [_, mode, index] = pid.split('_');
    let config = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    if(!config) throw new Error('miss xianshi XLBJ zhd_newhero');
    config = config["XLBJ"];
    if(!config) throw new Error('miss xianshi XLBJ config');
    let info = config[index];
    if(!info) throw new Error('miss xianshi XLBJ info');

    let bought = role[mode].xlbjrecord[index] || 0;
    role[mode].xlbjrecord[index] = ++bought;
    if (info.EXP) {
        role.addItemsNoSave({gsid: 38003, count: info.EXP});
    }
    role.markModified(mode);

    return [ info.ITEMS, info.PRICE, true ]
}