const redis = require("redis");

const _connect = function (cfg) {
    const redisClient = redis.createClient(cfg);
    redisClient.on("error", (error) => {
        console.error('REDIS CLIENT ERROR', error);
        setTimeout(() => {
            this._connect();// 自动重连
        }, 10000); // 10 秒钟重连
    });
    redisClient.on('connect', () => {
        console.log('REDIS CONNECT SUCCESS');
    });
    this._client = redisClient;
    return redisClient;
}
/**
 *
 * @param redis_config {{HOST: string, PORT: number, PASSWORD: string, DB?: number}}
 * @return {{_client: RedisClient}}
 */
const getInstance = (redis_config = {}) => {
    const cfg = {};
    for (const k in redis_config) {
        cfg[k.toLowerCase()] = redis_config[k];
    }

    // 包装 redis 调用的 async 方法(方法名和原本的相同
    const redisAsync = {};

    redisAsync._connect = _connect.bind(redisAsync, cfg);
    redisAsync._connect();
    for (const prop in redisAsync._client) {
        const func = redisAsync._client[prop];
        if (typeof func !== 'function') continue;
        redisAsync[prop] = function () {
            const params = arguments;
            return new Promise((resolve, reject) => {
                func.apply(redisAsync._client, [...params, (err, res) => err ? reject(err) : resolve(res)]);
            })
        }
    }
    return redisAsync;
};

/**
 * @doc https://www.npmjs.com/package/redis
 * @param redis_config {{HOST: string, PORT: number, PASSWORD: string, DB?: number}}
 */
module.exports = async function (redis_config) {

    const client = await getInstance(redis_config);
    return client;
}
