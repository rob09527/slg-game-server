
'use strict';

module.exports = exports = function () {
	const crypto = require('crypto');
	this.oid = this.channel + this.uid + this.pid + this.servid + Date.now();
	this.oid = crypto.createHash('md5').update(this.oid).digest('hex').toUpperCase();
	this.oid = (global.config.ORDER_PREFIX || 'KH') + this.oid;
}
