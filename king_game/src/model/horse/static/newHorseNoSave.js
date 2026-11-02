
'use strict'

const assert = require('assert');
const inweight = require('../../../util/random/inweight');
/**
 *
 * @param rid {string}
 * @param gsid {string}
 * @param expire {number|string?} 限时新坐骑到期时间
 */
module.exports = exports = function (rid, gsid, expire = undefined) {
	const config = global.gameconfig.horseitem[gsid];
	assert(config, 'invalid horse');
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
		    console.warn('不合法的新坐骑过期时间', expire);
        }
	}
    // 随机属性
    obj.property = [];
    for (let i = 0; i < config.PARR.length; i++){
		let pool = global.gameconfig.horseprop[config.PARR[i]];
		if(pool){
			let attr = pool[inweight(pool.deepMap('W'))];
			obj.property[i] = {key: attr.KEY.toLowerCase(), val: attr.VAL};
		}
	}
    // 随机技能
    obj.skill = [];
    for (let i = 0; i < config.SARR.length; i++){
        let pool = global.gameconfig.horseskill[config.SARR[i]];
		if(pool){
			let skill = pool[inweight(pool.deepMap('W'))];
			obj.skill[i] = skill.KEY;
		}
    }
	return new this(obj);
}
