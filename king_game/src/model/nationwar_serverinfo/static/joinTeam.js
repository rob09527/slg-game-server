
'use strict'

const assert = require('assert');
// 国战-把玩家某一小队加入加入阵营
module.exports = async function (servid, uid, areamark, set, index, teamid, teamdata) {
    await this.updateOne({ areamark },
        { $set: { [set]: teamdata } })
    // 记录玩家加入的队伍
    let user_battleinfo = await this.db.models.nationwar_battleinfo.findOne({ areamark, servid, uid });
    if (!user_battleinfo) {
        // 创建
        user_battleinfo = await this.db.models.nationwar_battleinfo.create({
            areamark,
            servid,
            uid
        })
    }
    // 更新玩家的入驻信息
    let state = user_battleinfo.c_battlesetstate || {};
    state[teamid] = 0;
    let settlement = user_battleinfo.c_settlement || {};
    settlement[teamid] = set != 'pre' ? `${set}_${index}` : `${set}`;
    // 更新
    await this.db.models.nationwar_battleinfo.updateOne({ servid, uid, areamark }, { $set: { c_battlesetstate: state, c_settlement: settlement } })
}
