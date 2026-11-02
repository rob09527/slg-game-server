'use strict'
/**
 * 是否在线
 * @example
 *          const res = await global.remote.isonline('rid');
 * @param rid {string}
 * @return {boolean}
 */
module.exports = async function (rid) {
    return Boolean(CLIENT_POOL[rid]) ? `${global.config.HOST}:${global._PORT}` : false;
}
