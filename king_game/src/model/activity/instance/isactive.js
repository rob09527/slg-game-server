
'use strict';


module.exports = exports = function (role) {
	const {start, etime} = this.getInterval(role);
	return Date.in(start, etime);
}