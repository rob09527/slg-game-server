'use strict'

/**
 * 刷新活动配置
 */
module.exports = async function () {
    global.ACTIVITY = await global.dao.activity.init(); // 初始化活动配置
}
