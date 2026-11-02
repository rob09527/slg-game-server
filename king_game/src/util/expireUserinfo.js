// 锁前缀，用于区分不同的锁
//24小时保持 每日自动更新
module.exports = exports = async function (lockName, get, info) {
    // 获取当前日期
    const currentDate = new Date();
    // 提取年、月、日
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1，并且确保是两位数
    const day = String(currentDate.getDate()).padStart(2, '0'); // 确保日期是两位数
    // 使用-符号组合成key
    const dateKey = `${year}-${month}-${day}`;
    console.log(dateKey); //输出类似 "2023-10-14" 这样的字符串
    const LOCK_PREFIX = 'lock:';
    const lockKey = LOCK_PREFIX + dateKey + lockName;
    if (get) {
        let result = await global.redis.get(lockKey)
        if (!result) {
            result = {
                count: global.gameconfig.surrendersearch[0][0].FREES,
                destined: global.gameconfig.surrendersearch[2][0].FREES,
                index: 0,
                spy: 0,
                battle: {
                }
            }
            await global.redis.set(lockKey, JSON.stringify(result))
            await global.redis.expire(lockKey, 24 * 60 * 60)
            return result
        }
        return JSON.parse(result)
    }


    let data = await global.redis.set(lockKey, JSON.stringify(info))
    let result = await global.redis.expire(lockKey, 24 * 60 * 60)
    return data
}





