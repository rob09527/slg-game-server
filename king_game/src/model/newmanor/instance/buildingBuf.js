
'use strict'
const assert = require('assert');
// 功能性建筑加成
module.exports = exports = async function () {
    // 排除资源形建筑 
    let info = this.toJSON();
    let building = info.building;
    let data = {};
    // 取出配置,计算资源
    const { BUILD_MAX: build_max = {}, UP_BUILDING: up_building = {} } = global.gameconfig.newmanor;
    assert(build_max && up_building, 'invalid config');
    for (let b in building) {
        let b_info = building[b];
        let config = up_building[b].INFO;
        if (build_max[b] && build_max[b].TYPE == 3) {
            //  加成型
            let att = config[b_info.lv].ATT[0];
            if (!att || (att && !att.NUM)) continue;
            data[att.ID] = data[att.ID] || 0;
            data[att.ID] += att.NUM;
        }
    }
    return data;
}