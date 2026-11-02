'use strict'


// 定时器
exports.name = "军团战锁阵容"; // 类似一句中文注释，后续后台可以展示该名字,

const moment = require('moment');

exports.cron = async function () {
    return global.gameconfig.legionpvp.CONFIG.LOCK_TEAM;
}

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    const now = new Date();
    console.log('START LOCK LEGION TEAM', moment(now).format('YYYY-MM-DD HH:mm:ss'));
    // 找出 期号, 就是找出锁整容之前的第一个匹配日
    let DAY = global.gameconfig.legionpvp.CONFIG.MATCH.split(' ').pop().split(',');
    while (!DAY.includes(now.getDay().toString())) {
        now.setDate(now.getDate() - 1);
    }
    const pvpDate = moment(now).format('YYYY-MM-DD');
    const pvpInfos = await global.dao.legionpvp.find({pvpDate}); // 找出本期所有参与军团
    const legions = [];
    for (const pvpInfo of pvpInfos) {
        legions.push(...pvpInfo.legion.filter(Boolean));
    }
    for (const legionid of legions) {
        try {
            const legion = await global.dao.legion.findOne({_id: legionid}, {_members: 1});
            if (legion) {
                const teaminfo = await global.dao.legionpvpteam.getUnlockTeam(legion);
                const specialbuff = teaminfo.legionbuff; // 大龙全队buff 提出来
                teaminfo.legionbuff = undefined;
                await global.dao.legionpvpteam.create({
                    pvpDate: pvpDate,
                    team: teaminfo,
                    specialbuff,
                    legion: legionid
                });
            } else {
                // 军团被解散了
                await global.dao.legionpvpteam.create({
                    pvpDate: pvpDate,
                    team: {
                        "top": [],
                        "mid": [],
                        "down": []
                    },
                    specialbuff : [],
                    legion: legionid
                });
            }

        }catch (e) {
            console.error('LEGION PVP SHAPSHOT ERROR AT:' + legionid, e);
        }
    }

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
