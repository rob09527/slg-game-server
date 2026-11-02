'use strict'
const assert = require("assert");
/**
 * 角色是否被禁言
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_ismute({_id: rid}, 3600); // 需加 agent_ 前缀
 * @param roleinfo {{_id?: string, uid?: string, rno?: number, servid?: number}}
 */
module.exports = async function (roleinfo) {

    const role = await global.dao.role.findOne(roleinfo, {uid: 1, _id: 1});
    assert(role, 'err role');
    return await role.isMute();
}
