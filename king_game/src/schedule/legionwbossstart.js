'use strict'


// 定时器
exports.name = "军团神将试炼开始"; //
exports.force_on_time = true;


exports.cron = async function () {
    const CONFIG = global.gameconfig.legionwboss.CONFIG;
    return CONFIG ? CONFIG.START : '55 23 * * 4'; // 可以return 时间戳来实现定点定时器,若时间已过期 判断逻辑 return null 即可
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {

    const legionList = await global.dao.legion.find({ secretplace: { $gt: 0 } }, { _members: 1 });
    const legionMembers = [];
    legionList.forEach(l => l._members.forEach(m => legionMembers.push(m.rid)));
    await global.dao.role.updateMany({ _id: { $in: legionMembers } }, { $set: { 'others.90390.count': 1 } });
    const RankService = global.services.RankService;

    // 清理记分卡
    global.dao.legionwboss.remove({}).catch(console.error);

    // 清空排行榜
    await global.services.RankService.clearPatten('legionwboss', '*');
    await global.services.RankService.clearPatten('legionwbossrole', '*');

    // 重新分组
    let groupConfig = global.gameconfig.legionwboss_group;
    for (let info in groupConfig) {
        await global.dao.legionwbossgroup.updateMany({ servid: { $in: groupConfig[info] } }, { $set: { groupmark: `manual${info}`, update: Date.now() } });
    }
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
