
'use strict'

const assert = require('assert');

module.exports = exports = async function (rid, gsid) {
	const config = global.gameconfig.general[gsid];
	assert(config, 'invalid general');
	return new this({rid: rid, gsid: gsid});
}