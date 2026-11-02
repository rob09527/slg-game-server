const assert = require('assert');
const moment = require('moment')
/**
 * 创建一个boss
 * @param index {number}
 * @author 
 */
module.exports = exports = async function (index = 0) {
    const { BOSS } = global.gameconfig.fantasy;

    assert(BOSS, 'invalid boss config');
    const config = BOSS[index];
    assert(config, 'invalid boss index');
    let nextidx = index + 1 >= BOSS.length ? 0 : index + 1;
    return this.create({
        bossidx: index,
        bossid: +config.BOSSID,
        nextidx,
        startAt: moment().startOf('day').valueOf()
    });
}
