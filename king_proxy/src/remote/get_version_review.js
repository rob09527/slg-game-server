'use strict'

/**
 * 获取版本审核期的配置 - 微信小游戏(h5)
 *
 * @return {}
 */
module.exports = async function () {
    return global.VERSIONREVIEW || {};
}
