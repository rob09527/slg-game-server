'use strict'

/**
 * 设置审核服版本条件
 * @example 游戏服代码实例
 *          const res = await global.remote.proxy_set_preview('arg1', 'arg2');
 *
 * @param appversion
 * @param platform
 * @param bundle
 * @return {Promise<any>}
 */
module.exports = async function (appversion, platform, bundle) {
    global.PREVIEW = {
        appversion,
        platform,
        bundle
    }
    // 把定向配置通过 mongo 持续化保存
    await global.dao.previewcfg.deleteMany({});
    await global.dao.previewcfg.create(global.PREVIEW);
    return global.PREVIEW;
}
