
/*
	生成小组标记
*/

'use strict'

module.exports = exports = function () {
	return Number.parseInt(`${Math.trunc(Math.random() * 10000)}${Date.now()}`).toString(16);
}