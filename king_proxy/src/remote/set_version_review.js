'use strict'

/**
 * 设置版本审核期的配置 - 微信小游戏(h5)
 *  const res = await global.remote.proxy_set_version_review('arg1', 'arg2');
 * @param appversion
 * @param isreview
 * @return {Promise<any>}
 */
module.exports = async function (appversion = '', isreview = false) {
    global.VERSIONREVIEW = {
        appversion,
        isreview
    }
    // 把定向配置通过 mongo 持续化保存
    await global.dao.versionreview.deleteMany({});
    await global.dao.versionreview.create(global.VERSIONREVIEW);
    return global.VERSIONREVIEW;
}
