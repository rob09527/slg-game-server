
'use strict'

const moment = require('moment');
const assert = require('assert');
const {curl} = require('urllib');

module.exports = exports = async function (...args) {
	let [type, seed, player, enemy, uid, battleid] = args;
	const {BASE, ENV, NAME} = global.config.SCF;
	const url = [BASE, ENV, NAME].join('/');
	const opts = {
		method: 'POST',
		contentType: 'json',
		dataType: 'json',
		data: {type, seed, player, enemy}
	}
	const {data: ret, status} = await curl(url, opts);
	assert(status == 200, 'scf reqfail');
	assert(!ret.errorCode, 'battlecal fail');
	let now = moment().format('YYYY-MM-DD HH:mm:ss');
	console.log(`BATTLECAL ${type} ${uid} ${battleid.toString()} ${ret.reqid} ${now}`);
	return ret;
}