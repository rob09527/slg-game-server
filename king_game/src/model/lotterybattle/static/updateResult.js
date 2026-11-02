
'use strict'

const assert = require('assert');

module.exports = async function (battlemark, result, videoid) {
	assert(result, 'result nexist');
	assert(videoid, 'videoid nexist');
	let ret = {
		result,
		videoid,
	}
	let $set = {
		_result: JSON.stringify(ret),
	}
	await this.updateMany({battlemark}, {$set});
}