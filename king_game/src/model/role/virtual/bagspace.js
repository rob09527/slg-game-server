
'use strict';

const assert = require('assert');

module.exports = exports = function () {
	const {BAGSPACE_BASE, BAGSPACE_EXT} = global.gameconfig.others;
	return this.getItems(90158).count * 5 + BAGSPACE_BASE + global.gameconfig.vip.BAG[this.vip] + (this.special.zx && this.special.zx > Date.now()? BAGSPACE_EXT: 0);
}