
'use strict';

const assert = require('assert');

module.exports = exports = function () {
	let legionlevelNum = global.gameconfig.legionlevel.length;
	if (this.level >= legionlevelNum) {
		return global.gameconfig.legionlevel[this.level -1].EXP;
	}else {
		return global.gameconfig.legionlevel[this.level].EXP;
	}
}