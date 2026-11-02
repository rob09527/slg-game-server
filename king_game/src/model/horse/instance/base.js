
'use strict'

const assert = require('assert');

module.exports = exports = function () {
	const config = global.gameconfig.horseitem[this.gsid];
	assert(config, 'invalid horse');

	let data = {}
	data.guid = this._id.toString();
	data.gsid = this.gsid;
	data.owner = this.owner;
	data.level = this.level;
	data.skill = this.skill;
	data.study = this.study;

	data.property = [];
	data.next = []

	//计算总共升级等级
	let level = this.level;
	let bconfig = config;
	while(bconfig.BGSID) {
		bconfig = global.gameconfig.horseitem[bconfig.BGSID];
		if(!bconfig) break;
		level += bconfig.MAXLEVEL;
	}
	let CONFIG = global.gameconfig.horselvlprop[config.QUALITY] || {}
	let NCONFIG = global.gameconfig.horselvlprop[config.QUALITY+1];
	for (let i = 0; i < this.property.length; i++) { // 基础值
		let obj = this.property[i];
		let key = obj.key.toUpperCase();
		// 等级加成
		let add_level = (CONFIG[key] || 0) * (level - 1);
		data.property[i] = {key: obj.key, val: obj.val + add_level};
		// 下一级加成
		if(this.level < config.MAXLEVEL){
			let add_level = (CONFIG[key] || 0) * level;
			data.next[i] = {key: obj.key, val: obj.val + add_level};
		}else{
			if(NCONFIG){
				let add_level = (NCONFIG[key] || 0) * level;
				data.next[i] = {key: obj.key, val: obj.val + add_level};
			}
		}
	}
	return data;
}
