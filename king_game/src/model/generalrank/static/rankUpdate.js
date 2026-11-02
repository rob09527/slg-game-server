'use strict';

const assert = require('assert');

/**
 *
 * @param general {{guid: string, gsid: number, power: number, level: number}}
 */
module.exports = exports = async function (general, role) {
    const gname = global.gameconfig.generalname[general.gsid];
	if(general.level < 100 || general.issoul){
		this.deleteOne({guid: general.guid}).catch(console.error);
		return null;
	}
	await this.updateOne({
		guid: general.guid,
	}, {
		$set: {
			gname,
			power: general.power,
			role: role,
			gsid: general.gsid,
			level: general.level,
			skin: general.skin
		}
	}, {
		upsert: true,
		new: true,
		setDefaultsOnInsert: true
	});
};
