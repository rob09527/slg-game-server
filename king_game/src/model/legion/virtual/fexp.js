
'use strict';

const assert = require('assert');

module.exports = exports = function () {
	let exp = this._fexp;
	const config = global.gameconfig.legionflevel;
	for (const info of config) {
		const next = info.EXP;
		if (typeof next !== 'number' || exp < next) break;
		exp -= next;

	}
	return exp;
}