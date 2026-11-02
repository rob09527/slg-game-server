'use strict'

const ms = require('ms');
const DELAY_INTERVAL = ms('7d');// 结束时间

// 定时器
exports.name = "巅峰赛取玩家巅峰赛阵容";
let endDay;

exports.cron = async function () {
    let cron = global.dao.topking.finishtime();
    endDay = cron + DELAY_INTERVAL;

    // 判断是否是在冠军赛期间
    if (cron < Date.now() && Date.now() < endDay) {
        // 小组赛,前两组赛
        cron = '30 19,20 * * *'
    } else {
        cron = undefined;
    }

    return cron;
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {

    let __time = process.hrtime();
    // 结束则抛出,判断是否决出冠军
    let champion = await global.dao.topking.findOne({ progress: 7 });
    if (champion) return;
    // 取到未淘汰的玩家 去取阵容
    let noOutList = await global.dao.topking.find({ isout: { $exists: false } }, { servid: 1, uid: 1 })
    // 发送取阵容请求
    for (let role of noOutList) {

        const userInfo = await global.dao.role.getOtherInfoAndBattleSet({ uid: role.uid, servid: role.servid }, 'topkingpvp');
        if (!userInfo) {
            console.error(`invalid gserv2 sid:${role.servid},uid:${role.uid},${userInfo.error}`);
        }
        let userBattleset = userInfo.battleset;
        if (userBattleset.error) {
            console.error(`invalid gserv sid:${role.servid},uid:${role.uid},${userBattleset.error}`)
            userBattleset = [{ mythic: {}, team: {} }, { mythic: {}, team: {} }, { mythic: {}, team: {} }];
        }

        // 空阵容则跳过
        if (userBattleset.length == 0) continue;
        // 保存到玩家的阵容里
        role.c_battleset = userBattleset;
        role.bsetpower = userInfo.bsetpower || 0;
        role.update = Date.now();
        role.markModified('c_battleset');
        role.markModified('bsetpower');
        role.markModified('update');
        await role.save();
    }
    console.error('TOPKING FETCHBATTLESET FINISH DONE >> ', new Date().toLocaleString(), process.hrtime(__time));
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
