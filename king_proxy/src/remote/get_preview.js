'use strict'

/**
 * 获取中转审核服的配置
 *
 * @return {Promise<any>}
 */
module.exports = async function () {
    return global.PREVIEW || {};
}
