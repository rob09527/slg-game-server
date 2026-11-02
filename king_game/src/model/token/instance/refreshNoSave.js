
'use strict';

const crypto = require('crypto');

module.exports = exports = function () {
	const salt = global.config.TOKENSALT || 'nosalt';
	this.update = Date.now();
	this.token = crypto.createHash('md5').update(this.uid+salt+this.update).digest('base64');
}