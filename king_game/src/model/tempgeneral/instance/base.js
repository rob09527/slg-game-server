
'use strict'

const assert = require('assert');

module.exports = exports = function () {
	const config = global.gameconfig.general[this.gsid];
	assert(config, 'invalid general');

	let data = this.toJSON({virtual: true});

	data.power = 0;
	data.power += (data.property.hp || 0)    * 0.0625;
	data.power += (data.property.atk || 0)   * 1;
	data.power += (data.property.def || 0)   * 2.5;
	data.power += (data.property.mdef || 0)  * 2.5;
	data.power += (data.property.pasp || 0)  * 10;
	data.power += (data.property.ppthr || 0) * 10;
	data.power += (data.property.pmthr || 0) * 10;
	data.power += ((data.property.pcri || 0) - 50)  * 10;
	data.power += ((data.property.pcrid || 0) - 1500) * 2;
	data.power += (data.property.pdex || 0)  * 10;
	data.power += (data.property.pmdex || 0) * 10;
	data.power = Math.floor(data.power);

	data.star = config.STAR;
	data.camp = config.CAMP;
	data.occu = config.OCCU;
	data.occu2 = config.OCCU2;
	data.skill = config.SKILL;

	data.exclusive.gsid = config.EXCLUSIVE;

	data.guid = data._id.toString();

	delete data.battleset;
	delete data.id;
	delete data.__v;
	delete data.rid;
	return data;
}