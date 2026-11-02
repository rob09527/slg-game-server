
'use strict'

module.exports = exports = function () {

	let tmp = this.toJSON();
	tmp.stime = tmp.create;
	tmp.etime = tmp.create + 30 * 24 * 60 * 60 * 1000;
	tmp.id = tmp._id;

	delete tmp.create;
	delete tmp._id;
	delete tmp.__v;
	delete tmp.rid;

	return tmp;
}