
const assert = require('assert');
// 更新国战阵容
module.exports = async function (opt) {

    let { servid, uid, bsindex } = opt
    // 查areamark
    let areamark = await this.db.models.nationwar_serverinfo.findAreamarkByServid(servid);
    let user = await this.db.models.nationwar_battleinfo.findOne({ areamark, servid, uid })
    if (!user) {
        // 创建
        user = await this.db.models.nationwar_battleinfo.create({
            areamark,
            servid,
            uid
        })
    }
    // 跨服取去计算好的阵容信息
    let userInfo = await global.dao.role.getOtherInfoAndBattleSet({ uid, servid }, 'nationwar');
    let userBattleset = userInfo.battleset;

    // 空阵容则跳过
    let bst_power = {};
    for (let info in userInfo.team) {
        bst_power[info] = userInfo.teampower[info] || 0
    }
    assert(user, 'invalid user');
    let new_bset = user.c_battleset || {};
    new_bset[bsindex] = userBattleset[bsindex] || {};
    user.c_battleset = new_bset;
    user.c_totalpower = userInfo.power;// 阵容总战斗力
    if (userInfo && userInfo.military_level) {
        user.honor_value = userInfo.military_level || 1; // 军衔值
    } else {
        user.honor_value = 1; // 军衔值
    }
    if (userInfo && userInfo.rname) {
        user.rname = userInfo.rname; // 玩家名字
    } else {
        user.rname = null; // 玩家名字
    }
    user.c_battlesetpower = bst_power;
    user.update = Date.now();
    user.markModified('rname');
    user.markModified('honor_value'); // 保存军衔制
    user.markModified('c_battleset');
    user.markModified('c_totalpower');
    user.markModified('c_battlesetpower');
    user.markModified('update');
    await user.save();
}