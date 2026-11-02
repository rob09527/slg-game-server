
'use strict'

module.exports = exports = function () {
	let info = this.toJSON();
	delete info.type;
	delete info.__v;
	delete info._id;
	return info;
}