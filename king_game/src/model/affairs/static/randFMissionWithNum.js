'use strict'

require('rx-apiwheel');

const assert = require('assert');

const {inweight} = require('./../../../util/random');

module.exports = exports = function (num, config) {
    config = config || global.gameconfig.affairs_f;
    if (!config || config.length === 0) {
        return [];
    }
    const rate = config.deepMap('CHANCE');
    let tmp = [];
    while (tmp.length < num) {
        let m = config[inweight(rate)];
        tmp.push({
            id: m.ID,
            hour: m.HOUR,
            mid: m.ID + '-' + (Math.round(Math.random() * 10000) + 10000), // 增加一个唯一ID
            lock: 0, create: Date.now(),
        })
    }
    return tmp;
}
