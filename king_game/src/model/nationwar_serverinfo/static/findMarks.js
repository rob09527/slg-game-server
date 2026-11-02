'use strict'

const assert = require('assert');

/**
 * 获取所有国战服务器所属跨服组
 * @return {Promise<string[]>}
 */
module.exports = async function () {
    const groups = await this.find({groupmark: {$exists: true}}, {groupmark: 1});
    return [ ...new Set(groups.map(g => g.groupmark))];
}
