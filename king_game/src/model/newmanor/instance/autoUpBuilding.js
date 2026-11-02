'use strict'
const assert = require('assert');
// 升级府邸伴随着自动升级的资源型建筑
module.exports = exports = async function (buildings) {
    /**
     * buildings
     * {
                "2": 33,
                "3": 35,
                "4": 37,
                "5": 39
            }
     */
    let tmp = this.toJSON();
    let building = tmp.building || {};
    let _buildings = buildings;
    for (let b in _buildings) {
        if (building[b]) {
            // 存在,则升级
            building[b].lv = _buildings[b];
        } else {
            let obj = {};
            obj.lv = 1
            obj.lastgain = Date.now();
            obj.id = b;
            building[b] = obj;
        }
    }
    return building;
}
