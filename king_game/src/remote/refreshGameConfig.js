'use strict'

/**
 *  重载数据库动态游戏配置
 */
module.exports = async function () {
    await global.dao.gameconfig.init(); //
}
