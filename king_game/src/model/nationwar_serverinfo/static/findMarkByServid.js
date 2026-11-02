
'use strict'

const assert = require('assert');

/**
 * 获取国战服务器所属跨服组标记
 * @param servid {number}
 * @return {Promise<string>}
 */
module.exports = async function (servid) {

	const group = await this.findOne({servers: servid}, {groupmark: 1});
	return group ? group.groupmark : null;
}
