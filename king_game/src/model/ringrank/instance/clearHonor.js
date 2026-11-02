
'use strict'
// 清空 荣耀值
/**
 * 返回当前暂存荣耀数值
 * @return {Promise<number>}
 */
module.exports = exports = async function () {
	const honor = this.honor;
	this.honor_pool = 0;
	// 倒退一点偏移时间（ 领取过后提前两秒，保证一定大于前端定时结算的荣誉值
	this.last_honor_time = Date.now() - ( this._time_offset || 0 ) - 2000;
	await this.save();
	return honor;
}
