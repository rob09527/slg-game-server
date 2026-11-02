'use strict'


/**
 * 排名服务
 * @type {RankService}
 */
class RankService {
    /**
     * 排名类型
     */
    type = "";


    /**
     *
     * @param type {string} 排序类型
     * @param groupid {string} 服务器分组id(如果是跨服传递跨服mark,如果是全服统一，则无需传递该值
     */
    constructor(type, groupid = '') {

        this.type = type;
        this.REDIS_KEY = `KING:RANK:${type}`;
        if (groupid) {
            global.redis.sadd(this.REDIS_KEY + "-ALL", groupid);
            this.REDIS_KEY = `${this.REDIS_KEY}:${groupid}`;
        }
    }

    /**
     * 删除指定类型的排名
     * @param type {string}  删除所有类型的排名
     * @param groupid {string} PS: '*' 删除指定类型下面，所有的 groupid的排名
     * @return {Promise<void>}
     */
    static async clearPatten(type, groupid) {
        let REDIS_KEY = `KING:RANK:${type}`;
        const keys = [];
        if (groupid && groupid === '*') {
            const memberKey = REDIS_KEY + "-ALL";
            const list = await global.redis.smembers(memberKey);
            if (!list) {
                return;
            }
            for (const k of list) {
                keys.push(`${REDIS_KEY}:${k}`);
            }
            keys.push(memberKey);
        } else if (groupid) {
            REDIS_KEY = `${REDIS_KEY}:${groupid}`;
            keys.push(REDIS_KEY);
        }

        for (const key of keys) {
            await global.redis.del(key);
        }
    }

    /**
     * 清空该类型的排行榜
     */
    async clear() {
        await global.redis.del(this.REDIS_KEY);
    }

    /**
     * 设置分数 (score 不能有小数
     *  @example set({id:'a',score: 1},{id:'b',score: 2}) 或者 set("a", 1)
     * @param data {{id: string, score: number}|string|number}
     * @return {Promise<void>}
     */
    async set(...data) {
        const params = []; //  score1 member1 [score2 member2] ....
        let t = 1 - Math.floor(Date.now() / 1000) / 10000000000; // 小数部分记录时间戳(这样可以保证同分数按时间排序


        if (typeof data[0] === 'string' && typeof data[1] === "number") {
            params.push(+data[1] + t);
            params.push(data[0]);
        } else {
            for (const item of data) {
                if (isNaN(+item.score)) {
                    throw new Error('NaN For score');
                }
                let score = +item.score + t;
                params.push(score);
                params.push(item.id);
            }
        }

        await global.redis.ZADD(this.REDIS_KEY, ...params);
    }

    /**
     * 添加分数 (原子操作
     * @param id {string} 成员ID
     * @param add_score {number} 添加的分数 (不能有小数
     * @return {Promise<void>}
     */
    async inc(id, add_score) {
        const score = await global.redis.ZSCORE(this.REDIS_KEY, id); // 获取之前的分数
        let last_t = score - Math.floor(score); // 取出之前的时间戳（小数部分数据
        let t = 1 - Math.floor(Date.now() / 1000) / 10000000000;
        add_score = add_score + t - last_t; // 添加小数部分需要增加的数据(这样可以保证同分数按时间排序
        await global.redis.ZINCRBY(this.REDIS_KEY, add_score, id);
    }

    /**
     * 删除指定成员
     * @param id {string}
     * @return {Promise<void>}
     */
    async del(...id) {
        await global.redis.ZREM(this.REDIS_KEY, ...id);
    }

    /**
     * 删除指定排名的 区间的成员
     * @param start {number} -负数表示倒数
     * @param end {number}
     * @return {Promise<void>}
     */
    async delByRank(start, end) {
        if (start > 0 || end > 0) {
            // 因为 ZREMRANGEBYRANK 方法给定的 start end ,是按分数升序的(也就是 0 表示倒数第一)， 所以这里需要借用 total 来转换一下
            const total = await this.size();
            if (start > 0) {
                start = Math.max(total - start, 0);
            }
            if (end > 0) {
                end = Math.max(total - end, 0);
            }
        }
        if (start < 0) {
            start = -start - 1; // 因为redis排序按0开始的，所以-1表示倒数第一，下标为 0才对
        }

        if (end < 0) {
            end = -end - 1;
        }

        await global.redis.ZREMRANGEBYRANK(this.REDIS_KEY, Math.min(start, end), Math.max(start, end));
    }

    /**
     * 获取指定成员的分数
     * @param id {string}
     * @return {Promise<number>}
     */
    async getItemScore(id) {
        const score = await global.redis.ZSCORE(this.REDIS_KEY, id); // 获取之前的分数
        if (!score) return 0;
        return Math.floor(score);
    }

    /**
     * 获取指定成员的排名
     * @param id {string}
     * @return {Promise<number>}   不存在返回 null
     */
    async getItemRank(id) {
        const rank = await global.redis.ZREVRANK(this.REDIS_KEY, id); // 获取之前的分数
        if (rank === null) return null;
        return rank + 1;
    }


    /**
     * 获取总成员数
     * @return {Promise<number>}
     */
    async size() {
        return await global.redis.ZCARD(this.REDIS_KEY);
    }


    /**
     * 查询指定排名区间成员列表（按排名顺序返回，默认前100名
     * @param start {number} 开始排名,default 1
     * @param end {number} 结束排名 default 100
     * @return {Promise<[{id: string, score: number, rank: number}]>}
     */
    async rank(start = 1, end = 100) {
        if (start < 1 || (end < start)) return [];
        // 因为 redis 数据第一条为 0， 所以
        const arr = await global.redis.ZREVRANGE(this.REDIS_KEY, start - 1, end - 1, 'WITHSCORES');
        const out = [];
        for (let i = 0; i < arr.length / 2; i++) {
            out.push({
                id: arr[i * 2],
                rank: i + 1,
                score: Math.floor(arr[i * 2 + 1])
            })
        }
        return out;
    }

    /**
     * 根据分数区间查询成员ID数组
     * @param min
     * @param max {number}
     * @param offset
     * @param limit
     * @return {Promise<string[]>}
     */
    async itemsByScore(min = 0, max = 0, offset = 0, limit = 100) {
        const arr = await global.redis.ZRANGEBYSCORE(this.REDIS_KEY, min, max || '+inf', 'limit', offset, limit);
        return arr;
    }

}

module.exports = RankService;
