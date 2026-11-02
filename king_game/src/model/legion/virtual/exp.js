
'use strict';

const assert = require('assert');

module.exports = exports = function () {
	let exp = this._exp;
	const config = global.gameconfig.legionlevel;
	for (const info of config) {
		const next = info.EXP;
		if (typeof next !== 'number' || exp < next) break;
		exp -= next;
	}
	return exp;
}