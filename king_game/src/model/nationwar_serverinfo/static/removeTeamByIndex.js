
'use strict'

const assert = require('assert');
// 国战-通过下标移除玩家某一小队的队伍
module.exports = async function (areamark, set, index, posindex) {
    const info = await this.findOne({ areamark }, { [set]: 1 });
    if (!info) return [];
    // 哪一路
    let teamInfo = info[set];
    let result;
    // 判断是否是预备营
    if (index) {
        // 左军或者右军
        let _index = teamInfo[index][posindex]
        if (!_index) return []
        // 移除队伍信息
        result = teamInfo[index].splice(posindex, 1);
    } else {
        let _index = teamInfo[posindex]
        if (!_index) return []
        // 移除队伍信息
        result = teamInfo.splice(posindex, 1);
    }

    await this.updateOne({ areamark }, { $set: { [set]: teamInfo } })
    return result;
}
