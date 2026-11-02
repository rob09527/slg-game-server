
'use strict'

const debug = require('debug')('kaihei:launcher:' + require('./debug_extend')(__filename));

const crypto = require('crypto');

module.exports = exports = function (algorithm, key, iv) {

	debug(algorithm, key, iv);

	function encrypt(key, iv, data) {
		let cipher = crypto.createCipheriv(algorithm, key, iv);
		let crypted = cipher.update(data, 'utf8', 'base64');
		crypted += cipher.final('base64');
		return crypted;
	}

	function decrypt(key, iv, data) {
		let cipher = crypto.createDecipheriv(algorithm, key, iv);
		let crypted = cipher.update(data, 'base64', 'utf8');
		crypted += cipher.final('utf8');
		return crypted;
	}

	return {encrypt: encrypt.bind(null, key, iv), decrypt: decrypt.bind(null, key, iv)}
}