'use strict'

/**
 * 战斗服实例列表
 *
 * @example 战斗服实例列表
 *          const res = await global.remote.proxy_fightinstances();
 *
 * @return {Promise<any>}
 */
module.exports = async function () {
    let ret = Object.values(global.fightservs);
    //去重
    return ret.filter((o,idx) => { return ret.indexOf(o) == idx});
}
