
'use strict';

const moment = require('moment');
const time_format = 'YYYY-MM-DD HH:mm:ss';
module.exports = exports = function () {
	let tmp = this.toJSON();
	delete tmp.__v;
	delete tmp._id;
	tmp.start = moment(tmp.start).format(time_format);
	tmp.end = moment(tmp.end).format(time_format);
	return tmp;
}