/**
 * 添加任务进度
 * @param role
 * @param eventName {string}
 * @param times {number}
 * @param requireInfo {string|number}
 * @return {Promise<void>}
 */
module.exports = async function (role, eventName, times, requireInfo = '') {
    times = Number(times) || 1;
    const rid = role._id + '';

    const timeplayCache = await global.redis.hgetall(`KING:NEVENT:${rid}`);
    const now = Date.now();
    const expiredIndex = [];

    const addIndexes = []; // 需要增加进度的 战役index
    const _tmp_ = {};
    for (const index in timeplayCache) {
        if (+timeplayCache[index] < now) {
            expiredIndex.push(index);
        } else {
            const tConfig = global.gameconfig.chapter_new_event.TASK[index];
            if (tConfig) {
                for (const cfg of tConfig) {
                    if (cfg.EVENT === eventName) {
                        const require_info = cfg.REQUIRE_INFO ? cfg.REQUIRE_INFO : '';
                        const _key_ = index + eventName + require_info;
                        if(_tmp_[_key_]) { // 避免同类型重复
                            continue;
                        }
                        _tmp_[_key_] = 1;
                        addIndexes.push({
                            index: +index,
                            eventName,
                            require: require_info,
                        });

                    }
                }
            }
        }
    }
    if (expiredIndex.length) {
        await global.redis.hdel(`KING:NEVENT:${rid}`, ...expiredIndex); // 删除过期了的缓存
    }

    if (!addIndexes.length) return;

    for (const item of addIndexes) {
        const {index, require = ''} = item;
        let event_key = eventName + '_' + require;

        if (require) { // 如果有 特殊
            if (typeof requireInfo === 'number') { // 数字条件，比大小
                if (requireInfo < +require) {
                    continue;
                }
            } else if (requireInfo !== require) { // 其他比==
                continue;
            }
        }

        await this.updateOne({rid, index: +index}, {
            $inc: {
                [`task_process.${event_key}`]: times
            }
        })
    }

}
