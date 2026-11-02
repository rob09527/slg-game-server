'use strict';

/**
 *
 * @param generals {[{guid: string, gsid: number, power: number, level: number}]}
 *
 */
module.exports = exports = function (generals ) {
	// 被消耗的狗粮需要进行排行榜移除
	this.deleteMany({guid: {$in: generals.map(m => m.guid)}}).catch(console.error);
 };
