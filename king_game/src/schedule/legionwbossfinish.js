'use strict'
const tg = require('../util/textgetter');
// 神将试炼赛季结算奖励
const wbossConfig = global.gameconfig.legionwboss;

// 定时器
exports.name = "军团神将试炼结算"; //


exports.cron = async function () {
    const CONFIG = global.gameconfig.legionwboss.CONFIG;
    return CONFIG ? CONFIG.END : '0 2 * * 4'; // 可以return 时间戳来实现定点定时器,若时间已过期 判断逻辑 return null 即可
}

const sendReward = async (wlegionList, legionList) => {
    let mails = [];

    // 世界军团排行奖励
    for (let { legion, index } of wlegionList) {
        let legionInfo = await global.dao.legion.findOne({ _id: legion }, { _members: 1, wbosshistroyrank: 1 });
        if (legionInfo && legionInfo._members.length > 0) {
            let members = legionInfo._members;
            let rewardList = wbossConfig.LEGION_WORLD_REWARD;
            if (!rewardList) continue;
            let rewardInfo = rewardList.filter(({ MIN, MAX }) => MIN <= index + 1 && index + 1 <= MAX);
            if (!rewardInfo) continue;
            for (let member of members) {
                let role = await global.dao.role.findOne({ _id: member.rid }, { servid: 1, uid: 1, others: 1 });
                // 没有受到诅咒的玩家发放奖励
                if (!role) continue;
                if (role.getItems(90390).count != 1) continue;
                mails.push({
                    type: 2, rid: member.rid,
                    title: tg('LEGION_WBOSSRANKT'),
                    content: tg('LEGION_WBOSSRANKC', index + 1),
                    reward: rewardInfo[0].ITEMS,
                })
            }
            // 每个军团前20%,能获得奖励。小数向上取整
            let num = Math.ceil(legionList[legion].length * 0.2);
            for (let i = 0; i < num; i++) {
                let { uid, rid } = legionList[legion][i];
                let cond = {};
                if (rid) cond._id = rid;
                else {
                    if (!uid) continue;
                    cond.uid = uid;
                }
                let toprole = await global.dao.role.findOne(cond, { uid: 1, servid: 1 });
                if (!toprole) continue
                let topreward = wbossConfig.LEGION_HARM_FIRST;
                mails.push({
                    type: 2, rid: toprole._id,
                    title: tg('LEGION_WBOSS_USERT'),
                    content: tg('LEGION_WBOSS_USERC'),
                    reward: topreward
                })
            }

            // 当前排名大于(历史最高排名)则保存
            if (legionInfo.wbosshistroyrank > index + 1) {
                await global.dao.legion.updateOne({ _id: legion }, { $set: { 'wbosshistroyrank': index + 1 } });
            }
        }
    }
    await global.dao.mail.insertMany(mails);
}

/**

 * @return {Promise<void>}
 */
exports.main = async function () {


    // 获取所有分组标记
    let gmarklist = await global.dao.legionwbossgroup.distinct('groupmark');
    let __time = process.hrtime();
    for (let groupmark of gmarklist) {
        // 获取所在组所有服务器编号
        let $in = await global.dao.legionwbossgroup.find({ groupmark });
        $in = $in.map(({ servid }) => servid);
        let cond = {
            servid: { $in },
        }
        let select = {
            uid: 1,
            servid: 1,
            legion: 1,
            totaldamages: 1,
            rid: 1,
            lname: 1
        }
        // 找出所有记录
        let roleList = await global.dao.legionwboss.find(cond, select);
        // 计算世界军团伤害总排行
        let worldLegion = {};
        for (let { legion, totaldamages } of roleList) {
            worldLegion[`${legion}`] = worldLegion[`${legion}`] || 0;
            worldLegion[`${legion}`] += totaldamages;
        }
        let wlegionrank = [];
        // 拼接军团排行数据
        for (let [legion, total] of Object.entries(worldLegion)) {
            wlegionrank.push({ legion, total });
        }
        // 世界军团伤害排行排序
        wlegionrank = wlegionrank.sort((a, b) => {
            return b.total - a.total
        });
        // 计算军团排名
        wlegionrank = wlegionrank.map((info, index) => {
            info.index = index;
            return info;
        });
        // 整理军团格式
        // legionList{"legionid":[member]}
        let legionList = {};
        for (let role of roleList) {
            legionList[role.legion] = legionList[role.legion] || [];
            legionList[role.legion].push(role);
        }
        // 军团内成员伤害排序
        for (let legion in legionList) {
            if (legionList[legion]) {
                legionList[legion].sort((a, b) => b.totaldamages - a.totaldamages);
            }
        }

        await sendReward(wlegionrank, legionList);

    }

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
