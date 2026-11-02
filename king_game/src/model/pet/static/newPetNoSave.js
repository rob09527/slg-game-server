
'use strict'

const assert = require('assert');

/**
 *
 * @param rid {string}
 * @param gsid {string}
 * @param expire {number|string?} 限时灵宠到期时间
 */
module.exports = exports = function (rid, gsid, expire = undefined) {
	const config = global.gameconfig.petitem[gsid];
	assert(config, 'invalid pet');
	const obj = {rid: rid, gsid: gsid};
	if(expire){
	 	if(!isNaN(expire)){ // 默认为直接设置到期时间
			obj.expireAt = expire;
		}else if(expire.endsWith('D')){ // 天
			expire = +expire.replace('D', '');
			const now = new Date();
			now.setHours(0,0,0,0); // 策划要求，按照领取日，零点记录起点
			obj.expireAt = now.getTime() + expire * 24 * 3600* 1000;
		} else if(expire.endsWith('H')){
			expire = +expire.replace('H', '');
			obj.expireAt = Date.now() + expire * 3600* 1000;
		} else {
		    console.warn('不合法的灵宠过期时间', expire);
        }
	}
	// 随机技能
	return new this(obj);
}
