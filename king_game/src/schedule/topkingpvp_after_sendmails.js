'use strict'

const ms = require('ms');
const DELAY_INTERVAL = ms('7d');// 结束时间
const textgetter = require("../util/textgetter");
// 冠军赛结束后的邮件发放
const topkingConfig = global.gameconfig.topkingpvprank
const finishFn = async function (params) {

    let {
        sid,
        list,
        type
    } = params;
    // 清空玩家王者阵容、武将上阵记录
    let udp = {
        $unset: {
            'battlearr.topkingpvp1': 1,
            'battlearr.topkingpvp2': 1,
            'battlearr.topkingpvp3': 1
        }
    }
    // 清空武将身上的阵容标记

    let udp1 = {
        $unset: {
            'battleset.topkingpvp1': 1,
            'battleset.topkingpvp2': 1,
            'battleset.topkingpvp3': 1
        }
    }
    let mails = [];
    let items = topkingConfig[type];
    for (let { uid } of list) {
        let role = await global.dao.role.findOne({ servid: sid, uid }, { _id: 1, uid: 1 });
        if (!role) continue;
        mails.push({
            type: 2, rid: role._id,
            title: textgetter(`TOPKINGPVP_${type}T`),
            content: textgetter(`TOPKINGPVP_${type}C`),
            reward: items,
        });
        // 清掉玩家阵容和武将阵容
        await global.dao.role.updateOne({ servid: sid, uid: role.uid }, udp);
        await global.dao.general.updateMany({ rid: role._id }, udp1);

    }
    if (mails.length > 0) {
        console.log('mail.lenght', mails.length);
        await global.dao.mail.insertMany(mails).catch(console.error);
    }
}

// 定时器
exports.name = "巅峰赛后发送邮件";
let endDay
exports.cron = async function () {
    let cron = global.dao.topking.finishtime();
    endDay = cron + DELAY_INTERVAL;

    // 判断是否是在冠军赛期间
    if (cron < Date.now() && Date.now() < endDay) {
        // 小组赛,前两组赛
        cron = '30 21 * * *'
    } else {
        cron = undefined;
    }

    return cron;
    
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 查出未发送邮件的玩家
    let outList = await global.dao.topkingmail.find({ finish: { $exists: 0 } }, { servid: 1, uid: 1, rewardtype: 1 });
    let servid_uids = {};
    for (let { servid, uid, rewardtype } of outList) {
        // 服务器id和type拼接
        let mark = [servid, rewardtype].join('|');
        servid_uids[mark] = servid_uids[mark] || [];
        servid_uids[mark].push({ uid });
    }
    for (let [sid_type, uids] of Object.entries(servid_uids)) {
        let [sid, type] = sid_type.split('|');
        console.log('sid', sid);
        console.log('type', type);
        console.log('uids', uids.length);
        // 异步发邮件
        await finishFn({
            sid, list: uids, type
        });
        // 更新邮件记录为已发送
        await global.dao.topkingmail.updateMany({ servid: parseInt(sid), rewardtype: type }, { $set: { finish: Date.now() } }).catch(console.error)
    }
    console.error(`TOPKINGPVP SEND MAILS DONE>>`, new Date().toLocaleString());
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
