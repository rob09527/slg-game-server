
'use strict'
const assert = require('assert');

// 返回玩家封地信息
module.exports = exports = async function () {
    let tmp = this.toJSON();
    tmp.items = [];
    tmp.buildinglist = {};
    let building = tmp.building || {};
    // 取出配置,计算资源
    const { BUILD_MAX: build_max = {}, UP_BUILDING: up_building = {} } = global.gameconfig.newmanor;
    assert(build_max && up_building, 'invalid config');
    for (let b in building) {
        let b_info = building[b] || {};
        assert(b_info,'invalid building');
        let config = up_building[b];
        if (build_max[b] && build_max[b].TYPE == 2) {
            // 需要类型2资源类才计算
            let res = config.INFO[b_info.lv].RES[0];
            // 根据上次获取时间,判断这次获得数量
            let count = Math.floor((Date.now() - b_info.lastgain) / res.TIME / 1000);
            let num = count * res.COUNT > res.MAX ? res.MAX : count * res.COUNT;
            if (num > 0) b_info.items = [{ gsid: res.ID, count: num }];
        }
    }
    tmp.buildinglist = building;
    delete tmp.create
    delete tmp._id;
    delete tmp.__v;
    delete tmp.rid;
    return tmp;
}
