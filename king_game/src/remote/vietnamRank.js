'use strict'


module.exports = async function (key) {
    const rediskey = `VIETNAM:RANK:${key}`;
    let value = await global.redis.get(rediskey);
    if (value) {
        return JSON.parse(value)
    } else {
        return []
    }
}
