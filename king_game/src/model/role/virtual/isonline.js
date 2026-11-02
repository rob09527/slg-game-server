
'use strict';

const assert = require('assert');
/**
 * 是否在线
 * @return {boolean}
 */
module.exports = exports = function () {

	return (Date.now() - this.update) < 60 * 30 * 1000;
}
