'use strict'
/**
 * 踢掉某些 servid 下的用户
 * @param servid {[number] | number}
 * @param params {number|string}
 */
module.exports = async function (servid = [], ...params) {
    const sMap = {};
    servid = Array.isArray(servid) ? servid : [servid];
    servid.forEach(sid => {
        sMap[sid] = 1;
    })
    for (const rid in CLIENT_POOL) {
        if (sMap[CLIENT_POOL[rid].role.servid]) {
            CLIENT_POOL[rid].disconnect(...params);
        }
    }
    return "OK"
}
