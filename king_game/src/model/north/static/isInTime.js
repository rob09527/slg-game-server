const parseCron = require('../../../util/parse_cron');
module.exports = async function () {
    const {CONFIG} = global.gameconfig.north_fight;

    const r = parseCron(CONFIG.START,  CONFIG.KEEPING * 60 * 1000);
    Object.assign(CONFIG, r); // 把计算过的配置缓存到 gameconfig 中
    const settle = parseCron(CONFIG.END,  0);
    const CURRENT_END_TIME = CONFIG.CURRENT_START_TIME + CONFIG.KEEPING * 60 * 1000  ;
    CONFIG.SETTLEMENTTIME = settle.NEXT_START_TIME;
    // 有计算缓存
    if (CONFIG.CURRENT_START_TIME && CONFIG.CURRENT_START_TIME < Date.now()) {
        if (CURRENT_END_TIME > Date.now()) {
            r.status = 1;
        } else {
            r.status = 0;
        }
    }
    CONFIG.CURRENT_END_TIME = CURRENT_END_TIME;
    return r.status;
}
