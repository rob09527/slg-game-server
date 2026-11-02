
'use strict'

const moment = require('moment');

module.exports = exports = function (type = 'unknow', uid = 'nouid', castitems = []) {
	let time = moment().format('YYYY-MM-DD HH:mm:ss');
	if (!Array.isArray(castitems)) castitems = [castitems];
	for (let {gsid, GSID, count, COUNT} of castitems) {
		let _gsid = GSID || gsid;
		if (Number.parseInt(_gsid) == 38005) {
			let _count = COUNT || count;
			console.log('ANALYSEYBNUM_'+type.toUpperCase(), uid, _count, time);
		}
	}
}