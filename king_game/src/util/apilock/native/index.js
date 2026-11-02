
'use strict'

const _keyappend = require('./key');
// todo white list

module.exports = exports = {
	chkAndLock: async ({serv, uid, path}) =>{
		const key = _keyappend(serv, uid, path);
		let now = Date.now();
		global.url_locks = global.url_locks || {};
		if (global.url_locks[key] && now < global.url_locks[key]) return global.url_locks[key];
		global.url_locks[key] = now + 5000;
		// console.error('>>LOCK', key);
		return false;
	},
	unLock: async ({serv, uid, path}) =>{
		// console.error('>>UNLOCK', key);
		const key = _keyappend(serv, uid, path);
		global.url_locks = global.url_locks || {};
		global.url_locks[key] = 0;
	}
}