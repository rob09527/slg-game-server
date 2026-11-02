'use strict'

exports.name = "群雄逐鹿-清理体力"; // 每日定时器，负责执行 周 日 月标记刷新
// 定时器语句
exports.cron = "0 0 5 * * *";
// exports.cron = "*/10 * * * * *"; //测试


exports.main = async function () {
    await global.dao.c_qxzl.updateMany({type:1}, {$set:{val:global.gameconfig.qxzlonecopy.VAL, help:global.gameconfig.qxzlonecopy.HELPVAL, record:[]}});
    await global.dao.c_qxzl.updateMany({type:2}, {$set:{val:global.gameconfig.qxzlgroupcopy.VAL, help:global.gameconfig.qxzlgroupcopy.HELPVAL, record:[]}});
    let now = Date.now() - 10 * 24 * 3600 * 1000;
    global.dao.c_qxzlreward.deleteMany({create:{$lt:now}}).then(_=>console.log("已删除一个月以上的奖励")).catch(error=>{console.error(error)})
}