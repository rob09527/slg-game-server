
'use strict'

const assert = require('assert');
const {curl} = require('urllib');
const bs = require('./../../../util/battleseason');

module.exports = exports = async function (...args) {
	let [type, seed, player, enemy, season,lcards, rcards] = args;
	assert(typeof enemy === 'object', 'invalid enemy');
	const {BASE, ENV, NAME} = global.config.SCF;
	const url = [BASE, ENV, NAME].join('/');
	const opts = {
		method: 'POST',
		contentType: 'json',
		dataType: 'json',
		timeout: 100000,
		data: {
			type,
			seed,
			player,
			enemy,
			season,
			lcards,
			rcards
		}
	}
	const {data: ret, status} = await curl(url, opts);
	assert(status == 200, 'scf reqfail');
	assert(!ret.errorCode, 'battlecal fail');
	return ret;
}
