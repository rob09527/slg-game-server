
'use strict';

const moment = require('moment');
const zhdpoint = require("../util/event/point");

module.exports = exports = function (config, cycle = 'unknow') {
	return function () {
		if (!config) return;
		let role_count = 0;
		let __time = process.hrtime();
		console.error('SCHEDULEREF ref'+cycle, new Date().toLocaleString());
		(async function () {
			// 在清理标记前做每日累充补偿
			await zhdpoint("DAYCHARGEREF")
			let cursor = global.dao.role.find({}, {
				others: 1,
			}).cursor();
			let role = await cursor.next();
			while(role) {
				try {
					let $set = {};
					for (const info of config) {
						const item = role.others[info.GSID];
						// 加多一个条件判断,如果找不到该字段并且初始化值为0,则跳过
						if (!item && info.COUNT == 0) continue;
						if (item && item.count == info.COUNT) continue;
						$set['others.'+info.GSID+'.count'] = info.COUNT;
					}
					if (Object.keys($set).length > 0) {
						await role.updateOne({$set});
						role_count++;
					}
				}catch(err){
					console.error(err);
				}
				role = await cursor.next();
			}
			if(cycle == "daily") {
				await zhdpoint("DAILYREF");
				// 日礼包清理
				global.dao.role.updateMany({'daypack': { $exists: 1 }}, { $set: { 'daypack.record': [], 'daypack.daycost': 0 }})
					.then(_ => console.error(`SCHEDULEREF refdaily daypack reset ${_.nModified}`))
					.catch(console.error);
				global.dao.role.updateMany({ 'daypack.day': 0 }, { $set: { 'daypack.ispay': 0 }})
					.then(_ => console.error(`SCHEDULEREF refdaily daypack reset day ${_.nModified}`))
					.catch(console.error);
				// 拍卖行礼包清理
				global.dao.c_auctionpack.deleteMany({ end: { $lt: Date.now() }})
					.then(_ => console.error(`SCHEDULEREF refdaily auctionpack ${_.nModified}`))
					.catch(console.error)
			}
		})().then(_ =>{
			let [sec, ms] = process.hrtime(__time);
			ms = Math.trunc(ms / 1000000);
			console.error(`>>REFRESH ${cycle} DONE AT ${moment()} ${sec} ${ms} ${role_count}`);
		}).catch(console.error);
	}
}