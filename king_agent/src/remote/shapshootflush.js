'use strict'

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
/**
 * 刷新LTV和日报统计
 * @example // 其他实例服执行示例
 * @param date
 */
module.exports = async function (date) {
    const tasks = [
        'shapshoot_for_dally',
        'shapshoot_for_ltv'
    ];
    if (global.__LTV_LOCK) { // 防止重复刷新
        await sleep(3000);
        return 'OK';
    }
    global.__LTV_LOCK = true;
    for (const task of tasks) {
        await require('king_game/src/schedule/' + task).main({date}).catch(console.error);
    }
    global.__LTV_LOCK = false;
    return 'OK';
}
