

// 锁前缀，用于区分不同的锁
const LOCK_PREFIX = 'lock:';
module.exports = exports = async function (lockName) {
    // 锁的唯一标识，例如使用UUID或时间戳
    const lockKey = LOCK_PREFIX + lockName;
    // 尝试设置键，如果不存在则设置，并设置过期时间
    let cz = await global.redis.del(lockKey)

}