'use strict'

/**
 * 异步任务刷新缓存的 role 信息
 * @param rid
 */
module.exports = async function (rid) {
    if (!CLIENT_POOL[rid]) { // 该用户没在该实例内存中忽略
        return;
    }
    const oldRole = CLIENT_POOL[rid].role;
    const role = await global.dao.role.findOne({_id: rid});
    role._gameserv = oldRole._gameserv;
    role._tokeninfo = oldRole._tokeninfo;
    CLIENT_POOL[rid].role = oldRole;
}
