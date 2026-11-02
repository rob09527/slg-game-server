'use strict'

/**
 * 异步任务刷新所有缓存role
 */
module.exports = async function () {

    for (const rid in CLIENT_POOL) {
        const oldRole = CLIENT_POOL[rid].role;
        const role = await global.dao.role.findOne({_id: rid});
        role._gameserv = oldRole._gameserv;
        role._tokeninfo = oldRole._tokeninfo;
        CLIENT_POOL[rid].role = oldRole;
    }
}
