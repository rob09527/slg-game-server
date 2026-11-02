'use strict'
/**
 * 踢掉一个用户
 * @param rid {string}
 * @param processKey{string} 实例KEY
 */
module.exports = async function (rid, processKey, ...params) {
    if(global.PROCESS_KEY === processKey) {
        // 如果是本实例就跳过
        return ;
    }
    CLIENT_POOL[rid] && CLIENT_POOL[rid].disconnect(...params);
    return "OK"
}
