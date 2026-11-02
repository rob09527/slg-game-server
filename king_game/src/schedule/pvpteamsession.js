'use strict'


// 定时器
exports.name = "组队演武赛季结算";

// 定时器语句
exports.cron = "0 2 * * 1";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 获取所有分组标记
    let gmarklist = await global.dao.kinggroup.distinct('groupmark');
    for (let groupmark of gmarklist) {
        // 获取所在组所有服务器编号
        let $in = await global.dao.kinggroup.find({ groupmark });
        $in = $in.map(({ servid }) => servid);
        let cond = {
            servid: { $in },
            'targets.0': { $exists: 1 }// 挑战的人数大于0
        }
        let sort = {
            score: -1,
            last: 1,
        }
        let teamlist = await global.dao.pvpteam.find(cond).sort(sort);
        // 按服务器分组
        let data = {};
        for (let i = 0; i < teamlist.length; i++) {
            let team = teamlist[i];
            data[team.servid] = data[team.servid] || [];
            data[team.servid].push({
                teamid: team._id.toString(),
                rank: i,
            })
        }
        for (let [, list] of Object.entries(data)) {
            await global.dao.pvpteam.sessionFinish({ list }).catch(e => {
                console.error('PVPTEAM SEASON FINISH ERROR', e)
            });
        }
    }
    // 清空本组组队
    let udp = {
        $unset: {
            'battlearr.teampvp': 1,
            'teamid': 1
        }
    }
    console.time(`PVPTEAM SEASON UNSET DONE`);

    await global.dao.role.updateMany({
        $or: [
            {
                'battlearr.teampvp': { $exists: 1 },
            },
            {
                'teamid': { $exists: 1 },
            }
        ]
    }, udp);
    // 清空武将身上的阵容标记
    udp = {
        $unset: {
            'battleset.teampvp': 1
        }
    }
    await global.dao.general.updateMany({ 'battleset.teampvp': { $exists: 1 } }, udp);
    console.timeEnd(`PVPTEAM SEASON UNSET DONE`);

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}

