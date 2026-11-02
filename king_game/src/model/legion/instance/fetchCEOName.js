
'use strict'

const assert = require('assert');

module.exports = exports = async function () {
	let ceo = this._members.deepQueryOne('pos', 2);
	assert(ceo, 'invalid ceoinfo');
	ceo = await this.db.models.role.findOne({_id: ceo.rid}, {rname: 1});
	return ceo.rname;
}