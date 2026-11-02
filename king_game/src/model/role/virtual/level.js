
'use strict';

const { roleLevel } = require("../../../util/rolecal");

module.exports = exports = function () {
	let exp = this.getItems(38001).count;
	return roleLevel(exp);
}