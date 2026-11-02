
'use strict';

const assert = require('assert');

module.exports = exports = function () {
	let exp = this._exp;
	let level = 0;
	const config = global.gameconfig.legionlevel;
	while(true){
		let next = config[level];
		if (!next) break;
		next = next.EXP
		if (typeof next !== 'number' || exp < next) break;
		exp -= next;
		level++;
	}
	return level;
}