'use strict'

const ms = require('ms');
const _ = require('lodash');
// 定时器
exports.name = "巅峰赛海选赛分组";

let endDay;
exports.cron = async function () {
    let cron = global.dao.topking.finishtime();
    endDay = cron +ms('7d');
    const DELAY_INTERVAL = ms('1d');
    cron += DELAY_INTERVAL + ms('15m');
    // 周六0点15分
    return cron;
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 判断当前时间是否已经过期
    if (Date.now() > endDay) {
        console.error('TOPKINGPVP SEA GROUP NO IN THIS TIME');
        return
    }
    let mark = 0; // 玩家的数字标记
    // 分组,设置组标记
    let gmarklist = await global.dao.topkingservergroup.distinct('areamark');
    for (let areamark of gmarklist) {
        // 获取所在组所有服务器编号
        let $in = await global.dao.topkingservergroup.find({ areamark });
        $in = $in.map(({ servid }) => servid);
        let roleList = await global.dao.topking.find({ servid: { $in } }, { uid: 1, servid: 1 }).sort({_id:1});
        // 小于128个人跳过
        if (roleList.length < 128) continue;
        // 随机
        roleList = _.shuffle(roleList);
        let seagroup = [];
        console.log('roleList', roleList.length)
        // 判断数量是否大于等于64
        if (roleList.length > 64) {
            while (roleList.length > 0) {
                let list = roleList.splice(0, 64);
                // 继续划分剩下的数据
                for (let i = 0; i < list.length; i++) {
                    seagroup[i] = seagroup[i] || [];
                    seagroup[i].push(list[i])
                }
            }
        }
        console.log('seagroup', seagroup.length);
        // 标记分组玩家所述的key
        for (let k = 0; k < seagroup.length; k++) {
            console.log(`seagroup${k},${seagroup[k].length}`)
            for (let h = 0; h < seagroup[k].length; h++) {
                let role = seagroup[k][h];
                if (!role) continue;
                let king = await global.dao.topking.findOne({ servid: role.servid, uid: role.uid });
                // 海选赛的组别
                king.seanum = k;
                king.mark = mark;
                king.markModified('mark');
                king.markModified('seanum');
                await king.save();
                mark++;
            }
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
