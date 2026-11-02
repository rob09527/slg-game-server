
'use strict'

const crypto = require('crypto');

module.exports = exports = function () {
	const salt = global.config.TOKENSALT || 'nosalt';
	this.key = crypto.createHash('md5').update((Date.now() + salt).toString()).digest('base64');
	this.valid = true;
	this.refresh = Date.now();
	return this.save();
}