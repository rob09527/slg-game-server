'use strict'
const assert = require('assert');
/**
 * 模拟充值
 * @example 游戏服代码实例
 *          const res = await global.remote.proxy_vir_reissue(servid, rid, pid);
 *
 * @return {Promise<any>}
 * @param servid
 * @param rid
 * @param pid
 */
module.exports = async function (servid, rid, pid) {
    return await global.dao.order.deliver(servid, rid, pid, null, 0, false, false, 1);
}
