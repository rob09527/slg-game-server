'use strict'
const assert = require('assert');
/**
 * 创建一个boss
 * @param rid {string}
 * @param bid {string|string[]}
 * @author awko
 */
module.exports = exports = async function (rid, bid) {

    bid = Array.isArray(bid) ? bid : [bid];
    let builds = bid.map(b => {
        const buildMax = global.gameconfig.manor.BUILD_MAX[b];
        assert(buildMax, 'manor config error,[' + b + '] not found]')
        return {
            rid: rid,
            id: b,
            type: buildMax.TYPE,
            lv: 1,
            pos: b
        }
    });
    await this.create(builds);
    return builds;
}
