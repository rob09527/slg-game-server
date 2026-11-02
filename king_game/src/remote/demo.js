'use strict'
/**
 * 远程调用函数(跨实例调用)
 * @example
 *          const res = await global.remote.demo('arg1', 'arg2');
 * @param arg1
 * @param arg2
 */
module.exports = async function (arg1, arg2) {
    return {
        arg1,
        arg2
    }
}
