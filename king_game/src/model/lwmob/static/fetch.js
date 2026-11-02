
'use strict'

const random = require('./../../../util/random');

module.exports = async function (rid, pos = 0, ignore = undefined) {
	let mob = await this.findOne({rid, pos});
	if (!mob) {
		const legionwarmob = ignore ? global.gameconfig.legionwarmob.filter(l => !ignore[l.ID] ) : global.gameconfig.legionwarmob;
		let rates = legionwarmob.deepMap('W');
		let config = legionwarmob[random.inweight(rates)];
		mob = await this.create({
			rid, pos,
			mobid: config.ID,
		})
	}
	return mob;
}
