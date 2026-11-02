

'use strict'

/**
 * 返回种子列表
 * @param  {Number} count 列表长度
 * @return {Array<Number>}
 */
module.exports = exports = function (count = 5) {
	// todo 再实现较复杂离散的种子列表
	let baseseed = Number.parseInt(this.seed);
	let seed_list = [];
	for (let i = 0; i < count; i++) {
		seed_list.push(baseseed + i + 1);
	}
	return seed_list;
}