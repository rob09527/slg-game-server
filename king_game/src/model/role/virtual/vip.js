
'use strict';

const { roleVip } = require("../../../util/rolecal");

module.exports = exports = function () {
	const exp = this.getItems(38003).count;
	return roleVip(exp);
}