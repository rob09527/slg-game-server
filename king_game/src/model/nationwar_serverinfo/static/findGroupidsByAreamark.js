
'use strict'

const assert = require('assert');

// 根据areamark查gameserver.groupid
module.exports = async function (areamark) {
    let info = await this.findOne({ areamark }, { groupmark: 1 });
    if (!info) return [];
    let groups = await this.find({ groupmark: info.groupmark }, { groupid: 1 })
    return [...new Set(groups.map(g => g.groupid))];
}
