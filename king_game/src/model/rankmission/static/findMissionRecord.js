
'use strict'

const assert = require('assert');

module.exports = exports = async function (type, missionIndex, groupid) {
	let record = await this.findOne({type, missionIndex, groupid});
	if (!record) record = new this({type, missionIndex,groupid});
	return record;
}
