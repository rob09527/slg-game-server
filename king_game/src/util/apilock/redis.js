
'use strict'

const _keyappend = require('./key');
// todo white list
const redis = global.redis_instance;

module.exports = exports = {
	chkAndLock: async ({serv, uid, path}) =>{
		const key = _keyappend(serv, uid, path);
		let ret = await redis.get(key);
		let now = Date.now();
		if (ret && now < ret) return true;
		redis.set(key, now + 5000).catch(console.error);
		return false;
	},
	unLock: async ({serv, uid, path}) =>{
		const key = _keyappend(serv, uid, path);
		redis.del(key).catch(console.error);
	}
}