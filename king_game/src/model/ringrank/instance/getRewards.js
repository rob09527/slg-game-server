
'use strict'
/**
 * 获取对应名次的可结算奖励
 * @return {Promise<number>}
 */
module.exports = exports = function () {

	return global.dao.ringrank.getRewardByRank(this.rank);
}
