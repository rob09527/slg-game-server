'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index] = pid.split('_');
    let reward = [], PRICE = 0;
    let config
    if (global.gameconfig.cjzmsyh[1][index]) {
        config = global.gameconfig.cjzmsyh[1][index]
        reward = config.item
        PRICE = global.gameconfig.cjzmsyh[1][index].PRICE
    } else {
        console.error("错误的礼包配置id", pid)
        throw ('Unexpected errors')
    }
    console.log("超级招募礼包", config.MARK)
    role.addItemsNoSave([{ gsid: 38003, count: config.VIPEXP }, { gsid: config.MARK, count: 1 }]);
    return [reward, PRICE, true]
}
