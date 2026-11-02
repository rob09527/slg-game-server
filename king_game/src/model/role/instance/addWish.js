/**
 * 许愿筑梦，增加许愿值
 */
'use strict'

const moment = require('moment');

module.exports = async function (recruit_type, times = 0) {
	let key = this.isXS('xs_xyzm')?'xs_xyzm':'xyzm';
	if(this.isXS('xs_xyzm')) key = this.isXSConKey(key);
	let {
		RECRUIT: config,
	} = global.gameconfig.zhd[key.toUpperCase()] || {};
	this.xyzm = this.xyzm || {};
	this.xyzm = {...{recruit: {friend: 0, normal: 0, premium: 0}}, ...this.xyzm}
	config = config[recruit_type];
	if (!config) return;
	if (this.isXS() && !this.isXS('xs_xyzm') ) return; // 排除新手
	let {
		EVERY,
		LIMIT,
	} = config;
	let before = this.xyzm.recruit[recruit_type.toLowerCase()]; 
	let after = before + EVERY * times;
	after = Math.min(after, LIMIT);
	console.log('XYZM', 'WISHADD', moment().format('YYYY-MM-DD HH:mm:ss'), this.uid, this.servid, recruit_type, times, before, after);
	// 最高值限制
	this.xyzm.recruit[recruit_type.toLowerCase()] = after;
	this.markModified('xyzm');
	let {
		friend: friend_wish,
		normal: normal_wish,
		premium: premium_wish,
	} = this.xyzm.recruit;
	let total = friend_wish + normal_wish + premium_wish;
	let rolltimes = this.xyzm.rolltimes || 0;
	let push_num = 0;
	let {
		WISH,
	} = global.gameconfig.zhd.XYZM;
	for (let i = rolltimes; i < WISH.length; i++) {
		if (WISH[i] > total) break;
		push_num++;
	}
	if (push_num > 0) {
		this.pushList = this.pushList || [];
		let msg = {
			type: 'act',
			content: {
				'xyzm': push_num,
			}
		}
		this.pushList.push(msg);
	}
}
