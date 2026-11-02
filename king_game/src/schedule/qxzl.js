const cursorUtil = require("../util/cursor");
// 定时器
exports.name = "群雄逐鹿-清理队伍"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句 每日的4点
exports.cron = "0 0 4 * * *";
// exports.cron = "*/10 * * * * *"; //测试

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    global.dao.role.updateMany({$set:{"others.90737.count":0,'others.90736.count':0,"dltp.mopup":[2,2,2,2,2]}}).then().catch(console.error);
    const cond = {challengetime :{$lt:Date.now() - 4 * 3600 * 1000}};
    let teamid = {'2':'qxzlteamid', '3':'hideteamid'};
    await cursorUtil(global.dao.c_qxzlteam.find(cond), async (team)=>{
        for (let {rid} of team.fellows) {
            const role = await global.dao.role.findOne({_id:rid});
            if (!role || !role[teamid[team.type]]) continue;
            role[teamid[team.type]] = '';
            await role.save();
        }
        await team.remove();
    })
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}