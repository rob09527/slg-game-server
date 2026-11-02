'use strict'

/**
 * 游戏给游戏服调用的远程函数 demo,
 * PS: 注意，游戏实例调用 proxy的远程函数，需加 proxy_ 前缀
 * @example 游戏服代码实例
 *          const res = await global.remote.proxy_demo('arg1', 'arg2');
 *
 * @param arg1
 * @param arg2
 * @return {Promise<any>}
 */
module.exports = async function (arg1, arg2) {
    return {
        arg1,
        arg2,
        proxy: 'yes',
        online_count : Object.values(global.gameservs).map(a => a.online_count)
    }
}
