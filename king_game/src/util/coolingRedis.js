const { promisify } = require("node:util");

//封地升级冷却
const LOCK_PREFIX = 'role:upgradeCooling:';
module.exports = exports = async function coolingRedis(rid, type, bid, config) {
    const lockKey = LOCK_PREFIX + rid + ":" + bid;
    if (type == "level") {
        let x = config.LEVELTIME * 1000 + 1
        let time = new Date().getTime() + x
        await global.redis.set(lockKey, time, 'NX', 'PX', x)
    } else if (type == "del") {
        await deleteCoolingRedis(lockKey)
    } else if (type == "get") {
        return await getCoolingRedis(lockKey)
    } else if (type == "getall") {
        return await getallCoolingRedis(rid)
    } else {
        throw ('type error')
    }


}

async function deleteCoolingRedis(key) {

    await global.redis.del(key)

}

async function getCoolingRedis(key) {

    let result = await global.redis.get(key)
    if (!result) {
        return 0
    }
    return result

}

async function getallCoolingRedis(rid) {
    const lockKey = LOCK_PREFIX + rid + ":" + "*"
    let keys = await global.redis.KEYS(lockKey)
    if (keys.length == 0) {
        return {}
    }
    let dd = await global.redis.mget(keys)
    if (keys.length !== dd.length) {
        return {}
    }
    let clientinfo = {}
    keys.forEach((e, index) => {
        let key = e.split(":")
        clientinfo[key[key.length - 1]] = dd[index]
    });


    return clientinfo

}


