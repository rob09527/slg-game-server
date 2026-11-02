
'use strict'

/**
 * 珍宝是否冷却
 */
module.exports = function () {
    const {
        FREE_CD_HOUR,
    } = global.gameconfig.zhenbao_roll_others;
    const free_ts = this.zhenbao_free;
    const CD_MS = FREE_CD_HOUR * 60 * 60 * 1000;
    // 免费是否冷却
    const is_cooldown = !free_ts || Date.now() >= free_ts + CD_MS;
    return {
        is_cooldown,
    }
}