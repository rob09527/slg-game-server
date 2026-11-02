
'use strict'

const assert = require('assert');

module.exports = exports = function (index) {
	const {[index]: config} = global.gameconfig.legionboss;
	if (!config) return;
	
	return {
		totaldamges: 0,
		start: Date.now(),
		roles: {},
	}
}