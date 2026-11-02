
'use strict'

const assert = require('assert');

// 根据areamark查组别信息
module.exports = async function (areamark) {
    const info = await this.findOne({ areamark }, { groupmark: 1 });
    return info ? info.groupmark : null;
}
