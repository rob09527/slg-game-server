
'use strict'

const assert = require('assert');

module.exports = exports = async function (rid) {
	let ceo = this._members.deepQueryOne('pos', 2);
	assert(ceo, 'invalid ceoinfo');
	if (ceo.rid !== rid) return;
	this.lastactive = Date.now();
	await this.save();
}