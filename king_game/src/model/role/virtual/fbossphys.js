
'use strict';

const assert = require('assert');

module.exports = exports = function () {
	const {MAXBPHYS, BPINTERVAL} = global.gameconfig.others.FRIEND;
	let num = MAXBPHYS - this.fboss.num;
	let recover = 0;
	if (this.fboss.last) Math.floor((Date.now() - this.fboss.last) / BPINTERVAL);
	return num + recover;
}