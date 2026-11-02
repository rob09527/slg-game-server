/**
 * 角色等级改变
 */

'use strict'

// const textgetter = require('./../../util/textgetter');

module.exports = {
	tags: {
		level: 1,
	},
	async onChange (gsid, change, count) {
		let old = count - change;
		// console.log("onChange",count,change,old,this.role.i())
		// if (old < 16 && count >= 16){ //避免跨等级超过16级
		// 	let rid = this.role.i();
		// 	let reward = global.gameconfig.others.LEVEL_16 || [{"GSID": 30006, "COUNT": 10}];
		// 	let mails =[{
		// 		rid, type: 2, reward: reward,
		// 		title: textgetter('LEVEL_16_T'),
		// 		content: textgetter('LEVEL_16_C'),
		// 	}];
		// 	global.dao.mail.insertMany(mails);
		// }
		for(let i = old + 1; i <= count; ++i){
			this.role[`LEVEL_UP_${i}`] = i;
		}
		this.role[`LEVEL_UP`] = count;
	}
}