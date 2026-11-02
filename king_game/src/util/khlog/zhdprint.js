
'use strict'

const moment = require('moment');

module.exports = exports = function (type ,role, ...others) {
	if(!role) return;
	let time = moment().format('YYYY-MM-DD HH:mm:ss')
	console.log(['ZHDPRINT_'.concat(type.toUpperCase()), role.servid, role.uid, role.vip, role.level, ...others, time].join(","))
}