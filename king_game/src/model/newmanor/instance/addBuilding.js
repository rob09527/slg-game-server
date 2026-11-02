'use strict'
const assert = require('assert');
// 解锁建筑
module.exports = exports = async function (bid) {
    let tmp = this.toJSON();
    let building = tmp.building || {};
    bid = Array.isArray(bid) ? bid : [bid];
    bid.forEach(b => {
        let obj = {};
        obj.lv = 1
        obj.lastgain = Date.now();
        obj.id = b;
        if (!building[b]) {
            building[b] = obj;
        }
    })
    return building;
}
