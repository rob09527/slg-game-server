'use strict'
const assert = require("assert");
/**
 * 解除禁言角色
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_unmute_role({_id: rid}, 3600); // 需加 agent_ 前缀
 * @param roleinfo {{_id?: string, uid?: string, rno?: number, servid?: number}}
 */
module.exports = async function (roleinfo) {

    const role = await global.dao.role.findOne(roleinfo, {uid: 1, _id: 1});
    assert(role, 'err role');
    const KEY = 'KING:MUTE:' + role._id;
    await global.redis.del(KEY);
    return "OK";
}
