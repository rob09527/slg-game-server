
'use strict'
// 结算 荣耀值
/**
 * 返回当前暂存荣耀数值
 * @return {Promise<number>}
 */
module.exports = exports = async function () {
	const honor = this.honor;
	this.honor_pool = honor;
	this.last_honor_time = Date.now();
	await this.save();
	return honor;
}
