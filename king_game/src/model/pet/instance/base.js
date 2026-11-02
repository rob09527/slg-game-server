
'use strict'

const assert = require('assert');

module.exports = exports = function () {
	const config = global.gameconfig.petitem[this.gsid];
	assert(config, 'invalid pet');

	let data = {}
	data.guid = this._id.toString();
	data.quality = this.quality;
	data.gsid = this.gsid;
	data.level = this.level;
	data.raise = this.raise;
	data.skills = this.skills;
	return data;
}
