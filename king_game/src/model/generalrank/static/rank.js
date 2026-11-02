'use strict';

const assert = require('assert');

/**
 *
 * @param general {{guid: string, gsid: number, power: number, level: number}}
 *
 * @param noUpdate {boolean} 是否不进行更新操作
 */
module.exports = exports = async function (general, noUpdate = false) {
    const gname = global.gameconfig.generalname[general.gsid];
	if(general.level < 140 || general.issoul){
		return null;
	}
	if (!noUpdate){
		this.rankUpdate(general);
	}
    const rank = await this.countDocuments({gname, power: {$gt: general.power}});
    return rank + 1;
};
