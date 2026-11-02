

// 锁前缀，用于区分不同的锁
const LOCK_PREFIX = 'lock:';
module.exports = exports = async function (lockName, lockTimeout, get) {
    // 锁的唯一标识，例如使用UUID或时间戳
    const lockKey = LOCK_PREFIX + lockName;
    const lockValue = 'my_unique_lock_value'; // 这里可以是任何唯一值，用于验证锁是否属于自己
    // 尝试设置键，如果不存在则设置，并设置过期时间
    let cz = await global.redis.get(lockKey)
    if (get) {
        return cz
    }
    if (cz) {
        return false
    }
    let result = await global.redis.set(lockKey, lockValue, 'NX', 'PX', lockTimeout)
    if (result == "OK") {
        return true;
    } else {
        return false;
    }
}
