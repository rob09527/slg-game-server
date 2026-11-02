
'use strict';

const assert = require('assert');

module.exports = exports = function () {
	return this.expireAt <= Date.now();
}
