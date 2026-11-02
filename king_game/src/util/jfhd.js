'use strict'

module.exports = exports = async function ({name, role, times = 1}, no_save) {
    let key = name.toLowerCase();
    let TYPE = key.toUpperCase();
    if (role.isXS('xs_' + key)) {
        key = 'xs_' + key;
        TYPE = role.isXSConKey(key).toUpperCase()
    }

    let config = global.gameconfig.zhd[TYPE];

    if (!config) {
        return;
    }
    let mark = config.MARK;
    // 在活动开启时间则增加标记
    if (global.ACTIVITY[key] && global.ACTIVITY[key].isactive(role)) role.addItemsNoSave({gsid: mark, count: times}); else return;
    if(no_save) return;
    await role.save();
}
