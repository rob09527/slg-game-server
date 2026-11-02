
'use strict'
/**
 * 国战取阵容
 */

exports.name = "国战-国战取阵容";
// 定时器语句
exports.cron = '55 19 * * 6,1,3,4'; // 19点55取阵容

exports.force_on_time = true; //强制锁定

let lastFlushTime = 0;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {
    // 服务器是否有淘汰
    let areamarks = await global.dao.nationwar_serverinfo.find({ isout: 0 }, { areamark: 1 });
    if (areamarks && areamarks.length == 0) {
        console.error('NATIONWAR FETCHBATTLESET NO DATA >> ', new Date().toLocaleString());
        return
    }
    let marks = areamarks.map((data) => data.areamark);

    // 取到未淘汰的玩家 去取阵容
    let noOutList = await global.dao.nationwar_battleinfo.find({ areamark: { $in: marks } },
        { servid: 1, uid: 1, c_battleset: 1, c_battlesetpower: 1 })

    if (noOutList.length == 0) {
        console.error('NATIONWAR FETCHBATTLESET NO USER DATA >> ', new Date().toLocaleString());
        return
    }
    // 发送取阵容请求
    for (let role of noOutList) {
        let userInfo = await global.dao.role.getOtherInfoAndBattleSet({ uid: role.uid, servid: role.servid }, 'nationwar');
        let userBattleset = userInfo.battleset;
        // 空阵容则跳过
        if (Object.keys(userBattleset).length == 0) continue;
        let bst_power = {};
        let bset = {};
        for (let info in userInfo.team) {
            bst_power[info] = userInfo.teampower[info] || 0;
        }
        // 保存队伍信息
        for (let set in userBattleset) {
            let teaminfo = userBattleset[set];
            if (teaminfo && Object.keys(teaminfo.team).length > 0) {
                bset[set] = teaminfo;
            }
        }
        // 保存到玩家的阵容里
        role.c_battleset = bset;
        role.c_battlesetpower = bst_power;
        role.c_totalpower = userInfo.power;// 阵容总战斗力
        if (userInfo && userInfo.military_level) {
            role.honor_value = userInfo.military_level || 1; // 军衔值
        } else {
            role.honor_value = 1; // 军衔值
        }
        if (userInfo && userInfo.rname) {
            role.rname = userInfo.rname; // 玩家名字
        } else {
            role.rname = null; // 玩家名字
        }
        role.update = Date.now();
        role.markModified('rname');
        role.markModified('honor_value'); // 保存军衔制
        role.markModified('c_totalpower');
        role.markModified('c_battleset');
        role.markModified('c_battlesetpower');
        role.markModified('update');
        await role.save();

        lastFlushTime = Date.now();
    }
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}