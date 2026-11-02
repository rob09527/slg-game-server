'use strict'

const ms = require('ms');
const DELAY_INTERVAL = ms('7d');// 结束时间

// 定时器
exports.name = "全服霸主-巅峰赛前4名";

let endDay;
exports.cron = async function () {
    let cron = global.dao.topking.finishtime();
    let endDay = cron + DELAY_INTERVAL + ms('2m'); // 往后延2分钟
    endDay = new Date(endDay);
    return endDay;
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 设置上个赛季最新的记录为已完成
    let roleList = await global.dao.topkingrank.find({finish: {$exists: 0}}).sort({cycle: -1});
    let updateList = [];
    let cycle = 0;// 上个周期
    for (let role of roleList) {
        if (!cycle) cycle = role.cycle;
        let user = global.dao.topkingrank.updateOne({
            cycle: role.cycle,
            uid: role.uid,
            servid: role.servid
        }, {$set: {finish: Date.now()}});
        updateList.push(user);
    }
    if (updateList.length > 0) await Promise.all(updateList);
    let gmarklist = await global.dao.topkingservergroup.distinct('areamark');
    for (let areamark of gmarklist) {
        // 获取所在组所有服务器编号
        let servers = await global.dao.topkingservergroup.find({areamark});
        servers = servers.map(({servid}) => servid);
        // 保存
        await global.dao.topkinglastservergroup.create({cycle: cycle + 1, areamark, servers});
    }
    // 查冠亚军巅峰玩家
    let toplist = await global.dao.topking.find({progress: {$in: [6, 7]}}).sort({progress: -1});
    for (let user of toplist) {
        let index = user.progress == 6 ? 2 : 1;
        // 根据服务器查战区
        let info = await global.dao.topkingservergroup.findOne({servid: user.servid});
        // 查是否存在记录
        let record = await global.dao.topkingrank.findOne({
            servid: user.servid,
            uid: user.uid,
            cycle: cycle + 1,
            areamark: info.areamark
        });
        if (record) continue;
        let obj = {
            mark: user.mark,
            areamark: info.areamark,
            servid: user.servid,
            uid: user.uid,
            cycle: cycle + 1,
            index
        }
        await global.dao.topkingrank.create(obj);
    }
    let gmarklists = await global.dao.topkingservergroup.distinct('areamark');
    for (let areamark of gmarklists) {
        // 获取所在组所有服务器编号
        let $in = await global.dao.topkingservergroup.find({areamark});
        $in = $in.map(({servid}) => servid);
        let roleList = await global.dao.topking.find({progress: 5, servid: {$in}}).sort({bsetpower: -1});
        // 插入第三第四名
        let num = 2;// 第二名开始
        for (let i = 0; i < roleList.length; i++) {
            num++;
            // 查是否存在记录
            let record = await global.dao.topkingrank.findOne({
                servid: roleList[i].servid,
                uid: roleList[i].uid,
                cycle: cycle + 1,
                areamark
            });
            if (record) continue;
            let obj = {
                mark: roleList[i].mark,
                areamark,
                servid: roleList[i].servid,
                uid: roleList[i].uid,
                cycle: cycle + 1,
                index: num
            }
            await global.dao.topkingrank.create(obj);
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
