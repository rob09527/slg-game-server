
'use strict'

const assert = require('assert');

// 根据服务器id查服务器所在的区编号
module.exports = async function (servid) {
	const info = await this.findOne({servers: servid}, {servid:1,areamark: 1});
	return info ? info.areamark : null;
}
