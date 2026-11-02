
'use strict'
const assert = require('assert');

module.exports = exports = async function () {
    let tmp = this.toJSON();
    tmp.items = [];
    // 取出配置,计算资源
    const config = global.gameconfig.manor.UP_BUILDING[tmp.id];
    assert(config, 'invalid manor up_building config');

    // 判断是否有钱庄加成
    let building = this._qianzhuang === undefined ? (await global.dao.manorbuilding.findOne({ rid: this.rid, id: 9 }) ):  this._qianzhuang ;
    let att = {NUM : 0};    // 钱庄收益比例
    if (building) {
        let moneyConfig = global.gameconfig.manor.UP_BUILDING[building.id].INFO;
        att = moneyConfig[building.lv].ATT[0];
    }

    // 资源地块才算资源
    if (tmp.type == 2) {
        let res = config.INFO[tmp.lv].RES[0];
        // 根据上次获取时间,判断这次获得数量
        let count = Math.floor((Date.now() - tmp.lastgain) * (1 + att.NUM / 1000) / res.TIME / 1000);
        let num = count * res.COUNT > res.MAX ? res.MAX : count * res.COUNT;
        if (num > 0) tmp.items = [{ gsid: res.ID, count: num }];
    }

    delete tmp.create
    delete tmp._id;
    delete tmp.__v;
    return tmp;
}
