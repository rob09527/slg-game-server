
'use strict';

const assert = require('assert');

const {
	ANONYMOUS_PREFIX = '主公S',
} = global.gameconfig.text;

module.exports = exports = function () {
	return this.rname || (ANONYMOUS_PREFIX + this.rno);
}