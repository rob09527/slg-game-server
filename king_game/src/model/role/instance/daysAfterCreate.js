
'use strict'

const moment = require('moment');
const ms = require('ms');

module.exports = exports = function () {
	let days = moment().startOf('day').valueOf() - moment(this.create).startOf('day').valueOf();
	days = days/ms('1 day') + 1;
	return days;
}