'use strict'
/**
 * 远程调用函数(提供给游戏实例或者 proxy服务调用)
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_demo('arg1', 'arg2'); // 需加 agent_ 前缀
 * @param arg1
 * @param arg2
 */
module.exports = async function (arg1, arg2) {
    return {
        arg1,
        arg2,
        agent: 'yes'
    }
}
