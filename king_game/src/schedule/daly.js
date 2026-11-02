'use strict'
const _type = require('../model/role/common/type');
const zhdpoint = require("../util/event/point");
exports.name = "每日定时器"; // 每日定时器，负责执行 周 日 月标记刷新

// 定时器语句
exports.cron = "0 0 0 * * *";
exports.force_on_time = true;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {

    const $unset = {};
    const $set = {};
    const NOW = new Date();
    const now = NOW.getTime();
    const weekDay = NOW.getDay(); // 周几 0-6,0:周天
    const date = NOW.getDate(); // 本月几号
    const refreshArr = [...global.gameconfig.refreshdaily];
    const weekConfig = global.gameconfig.refreshweek[weekDay];
    if (weekConfig) { // 周刷配置
        refreshArr.push(...weekConfig);
    }

    // 在清理标记前做每日累充补偿 , 每日累充
    await zhdpoint("DAYCHARGEREF")

    // 如果清楚逻辑前，需要换算返铜币
    /* @example
        let cursor = global.dao.role.find({'others.90000.count': {$gt: 0}}, {
            others: 1,
            props: 1,
            hide: 1,
            uid: 1,
            rno: 1
        }).cursor();
        let role ;
        while (role = await cursor.next()) {
            role.addItemsNoSave({
                GSID: 38006,
                COUNT: 1
            });
            await global.dao.role.updateOne({_id: role._id}, {
                $inc: {
                    'hide.38006.count': 1,
                },
                $unset: {
                    'others.90000': 1
                }
            })
        }

    * */


    if (global.gameconfig.refreshmonth && global.gameconfig.refreshmonth[date]) { // 月刷配置
        refreshArr.push(...global.gameconfig.refreshmonth[date]);
    }
    for (const item of refreshArr) {
        if (item.GSID == 93316) {
            continue;
        }
        const type = _type(item.GSID);
        if (item.COUNT) {
            $set[`${type}.${item.GSID}.count`] = item.COUNT;
        } else {
            $unset[`${type}.${item.GSID}`] = 1;
        }
    }

    if (+weekDay === 6) {
        // 刷新周末福利
        $unset.zmfl = 1;
    }
    // 清理 每日累充 领取记录
    $unset.daycharge = 1;
    // 清理 每日首充 领取记录
    $unset.mrsc = 1;
    // 清理 每日礼包 购买记录
    $unset.daygift = 1;
    // 清理 客户端临时缓存
    $set.tempClient = { generalUpPower: 0, generalUpLeg: 0, clear: 1 };
    // 每日道具使用限制
    $set.castlimit = {};
    // 清理 每日特惠 领取记录
    $unset.mrthyj = 1;
    // 更新 天命 刷新次数
    let LIMIT = global.gameconfig.deftiny.COST.LIMIT;
    $set['destiny.refersh'] = [LIMIT, LIMIT, LIMIT];

    // 清理周活动的每日刷新逻辑
    await zhdpoint("DAILYREF", $set, $unset);
    await global.dao.role.updateMany({}, { $set, $unset });

    // 日礼包清理
    await global.dao.role.updateMany({ 'daypack': { $exists: 1 } }, { $set: { 'daypack.record': [], 'daypack.daycost': 0 } })
        .then(_ => console.log(`SCHEDULEREF refdaily daypack reset ${_.nModified}`))
        .catch(console.error.bind(null, 'SCHEDULEREF refdaily daypack'));

    await global.dao.role.updateMany({ 'daypack.day': 0 }, { $set: { 'daypack.ispay': 0 } })
        .then(_ => console.log(`SCHEDULEREF refdaily daypack reset day ${_.nModified}`))
        .catch(console.error.bind(null, 'SCHEDULEREF refdaily daypack reset day'));
    // 拍卖行礼包清理
    await global.dao.c_auctionpack.deleteMany({ end: { $lt: now } })
        .then(_ => console.log(`SCHEDULEREF refdaily auctionpack ${_.nModified}`))
        .catch(console.error.bind(null, 'SCHEDULEREF refdaily auctionpack'));
    // 军团每日重置达到上限的签到经验
    let clean_obj = { _expdaily: 0, _dailytime: 0 }
    if (weekDay === 1) { // 每周1的零点 更新 活跃积分
        clean_obj.score = 0;
    }
    global.dao.legion.updateMany({}, { $set: clean_obj }).catch(console.error);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
