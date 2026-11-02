'use strict'
const assert = require('assert');
/**
 * 创建一个boss
 * @param rid {string}
 * @param bossid {string}
 * @author awko
 */
module.exports = exports = async function (rid, bossid) {
    const config = global.gameconfig.fboss[bossid];
    assert(config, 'invalid bossid');
    let now = Date.now();
    return this.create({
        rid,
        bossid,
        create: now,
        expireAt: now + config.MIN * 60 * 1000,
        totaldamges: 0,
        roles: [],
    });
}
