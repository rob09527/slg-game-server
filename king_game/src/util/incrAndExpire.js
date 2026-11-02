

// 锁前缀，用于区分不同的锁

module.exports = exports = async function (lockName, get) {
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
        let count = await global.redis.get(lockKey)
        if (!count) {
            return 0
        }
        return count
    }


    let count = await global.redis.incr(lockKey)
    let result = await global.redis.expire(lockKey, 48 * 60 * 60)
    return count
}




