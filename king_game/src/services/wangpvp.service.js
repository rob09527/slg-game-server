'use strict'


/**
 * 皇宫
 * @type {RankService}
 */
class WangpvpService {
    async del(key) {
        try {
            await global.cacheRedis.del(key);
        } catch (error) {
            console.log(`WangpvpService---->del${key}--->error`, error.stack);
        }
    };
    async set(key, data, expireTime) {
        try {
            if (typeof data == 'object') data = JSON.stringify(data);
            await global.cacheRedis.set(key, data);
            if (expireTime) await global.cacheRedis.expire(key, expireTime);
        } catch (error) {
            console.log(`WangpvpService---->set${key}--->error`, error.stack);
        }
    };
    async find(key) {
        try {
            let res = await global.cacheRedis.get(key);
            if (res) res = JSON.parse(res);
            return res;
        } catch (error) {
            console.log(`WangpvpService---->find${key}--->error`, error.stack);
            return null;
        }
    }
}
module.exports = () => {
    if (!this.wangpvpService) {
        this.wangpvpService = new WangpvpService();
    }
    return this.wangpvpService
};
