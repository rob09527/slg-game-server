
'use strict'

const battlechk = require('./battlechk');

module.exports = exports = async function (...args) {
	console.log('battlelogic [native] invoke');
	if (typeof args[2] !== 'string') args[2] = JSON.stringify(args[2]);		// player data
	if (typeof args[3] !== 'string') args[3] = JSON.stringify(args[3]);		// enemy data
	let ret;
	try {
		ret = await battlechk.apply(null, args);
	}catch(e) {
		console.error(e);
	}
	if (!ret) return;
	// console.error(ret.stdout);
	ret = ret.stdout.split('\n').filter(function (str) {
		return str.startsWith('|finial|');
	})[0].slice(8)
	ret = JSON.parse(ret);
	// console.error(ret);
	return ret;
}