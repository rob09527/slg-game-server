
const assert = require('assert');
const moment = require('moment')
// 定时器
exports.name = "奇门幻阵开启"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句 
exports.cron = async function () {
    let dbInfo = await global.dao.fantasy.findOne();
    if (!dbInfo) return null;

    const { BOSS } = global.gameconfig.fantasy;
    if (!BOSS) {
        console.error('[FANTASY] boss error')
        return null;
    }
    const { HOURS: hours } = BOSS[dbInfo.bossidx];
    let runTime = moment(dbInfo.startAt).add((+hours || 72), 'h').valueOf();
    console.log('<---- [FANTASY] start runTime =', runTime, hours);
    return runTime < Date.now() ? Date.now() + 100 : runTime; // 如果执行的时间小于当前时间
};

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {

    let curInfo = await global.dao.fantasy.findOne();
    const { BOSS } = global.gameconfig.fantasy;
    assert(BOSS, '[FANTASY] boss config error');

    // 开启新的一轮boss
    let newIndex = curInfo.bossidx + 1;
    if (newIndex >= BOSS.length) newIndex = 0;
    const config = BOSS[newIndex];
    assert(config, 'invalid boss index');

    // 删除上一期玩家挑战记录(再次清除一次)
    await global.dao.fantasyboss.deleteMany();
    // 删除上一期排行榜(再次清除一次)
    await global.services.RankService.clearPatten('fantasy', '*');

    let nextidx = newIndex + 1 >= BOSS.length ? 0 : newIndex + 1;
    let $set = {
        bossidx: newIndex,
        bossid: +config.BOSSID,
        nextidx,
        isSend: 0,
        startAt: moment().startOf('day').valueOf() // 是用当前时间还是当前时间的日期起始时间？？ //moment().startOf('day').valueOf()
    }
    await global.dao.fantasy.updateOne({ _id: curInfo._id }, { $set });

    // 刷新fantasy_reward定时任务
    await global.remote.agent_retimer('fantasy_reward')
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}