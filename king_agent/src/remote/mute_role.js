'use strict'
const assert = require("assert");
/**
 * 禁言角色
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_mute_role({_id: rid}, 3600); // 需加 agent_ 前缀
 * @param roleinfo {{_id?: string, uid?: string, rno?: number, servid?: number}}
 * @param time {number} 禁言时间单位秒（默认 3600秒
 */
module.exports = async function (roleinfo, time = 3600) {

    assert(time > 0, 'invalid time');
    const role = await global.dao.role.findOne(roleinfo, {uid: 1, _id: 1});
    assert(role, 'err role');
    const KEY = 'KING:MUTE:' + role._id;
    await global.redis.set(KEY, 1);
    await global.redis.expire(KEY, time);
    return "OK";
}
