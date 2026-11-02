'use strict'

/**
 * 游戏服实例列表
 *
 * @example 游戏服代码实例
 *          const res = await global.remote.proxy_gameinstances();
 *
 * @return {Promise<any>}
 */
module.exports = async function () {

    const games = Object.values(global.gameservs).map(g => {
        return {
            host: g.host,
            port: g.port,
            ip: g.ip,
            online_count: g.online_count,
            online: g.online
        }
    });

    return {
        games,
        agent: global.gametimer && {
            host: global.gametimer.host,
            port: global.gametimer.port,
            ip: global.gametimer.ip
        }
    }
}
