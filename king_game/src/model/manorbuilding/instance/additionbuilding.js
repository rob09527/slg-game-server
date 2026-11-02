
'use strict'
const assert = require('assert');
// 抽出功能性建筑
module.exports = exports = async function (excludeArr) {
    // exclude 排除的建筑id
    // 6靶场 7军械库 8兵营 9钱庄 
    if (!Array.isArray(excludeArr)) excludeArr = [excludeArr];
    let info = this.toJSON();
    let buildingList = await global.dao.manorbuilding.find({ rid: info.rid, type: 3, id: { $nin: excludeArr } }, { id: 1, lv: 1 });
    let data = {};
    if (buildingList.length > 0) {
        // 判断需要加的比例
        for (let building of buildingList) {
            let updateBuilding = global.gameconfig.manor.UP_BUILDING[building.id].INFO;
            let att = updateBuilding[building.lv].ATT[0];
            data[att.ID] = data[att.ID] || 0;
            data[att.ID] += att.NUM;
        }
    }
    return data;
}