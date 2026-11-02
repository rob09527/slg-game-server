
'use strict'
const assert = require('assert');
const tg = require('./../util/textgetter');
exports.name = "国战-发结算奖励";
// 定时器语句
exports.cron = '03 0 * * 5';

let lastFlushTime = 0;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {
	// 清理玩家
	const finalreward = async function (opt) {
		const nationwarConfig = global.gameconfig.nationwar_reward;
		let {
			sid,
			list,
			rank,
			groupid
		} = opt
		// 清空玩家王者阵容、武将上阵记录
		let udp = {
			$unset: {
				'battlearr.nationwar1': 1,
				'battlearr.nationwar2': 1,
				'battlearr.nationwar3': 1
			}
		}
		// 清空武将身上的阵容标记
		let udp1 = {
			$unset: {
				'battleset.nationwar1': 1,
				'battleset.nationwar2': 1,
				'battleset.nationwar3': 1
			}
		}
		let mails = [];
		let items = nationwarConfig['FINAL_RANK'][rank];
		console.log('NATIONWAR_FINAL_SERVERINFO', sid, list.length, rank)
		assert(items && items.length > 0, 'invalid reward items');
		for (let { servid, uid } of list) {
			let role = await global.dao.role.findOne({ servid, uid }, { _id: 1, uid: 1 });
			if (!role) continue;
			mails.push({
				type: 2, rid: role._id,
				title: tg(`NATIONWAR_FINAL_REWARD_T`),
				content: tg(`NATIONWAR_FINAL_REWARD_C`, rank + 1),
				reward: items,
			});
			// 清掉玩家阵容和武将阵容
			await global.dao.role.updateOne({ servid: servid, uid: role.uid }, udp);
			await global.dao.general.updateMany({ rid: role._id }, udp1);
			console.log('NATIONWAR_FINAL_REWARD', servid, uid, new Date().toLocaleString())
		}
		if (mails.length > 0) {
			console.log('mail.lenght', mails.length);
			global.dao.mail.insertMany(mails).catch(console.error);
		}
		await global.dao.auction.createAuction("nation", {
			type: rank + 1,
			groupid
		});
	}

	let nationwarInfos = await global.dao.nationwar_match.distinct('groupmark');
	for (let gmark of nationwarInfos) {
		let result = await global.dao.nationwar_serverinfo.findOne(
			{ groupmark: gmark, isout: 0 },
			{
				areamark: 1,
				isout: 1,
				servid: 1,
				groupid: 1
			})
		if (result) {
			// 查这个服下面的所有未领取结算奖励的玩家
			let userList = await global.dao.nationwar_battleinfo.find({ areamark: result.areamark, finalreward_get: { $exists: 0 } }, { servid: 1, uid: 1 });
			await finalreward({ sid: result.servid, list: userList, rank: 0, groupid: result.groupid });
			console.error('NATIONWAR_FINISH_REWARD', result.areamark, result.servid, result.isout, new Date().toLocaleString());
		}
		let result2 = await global.dao.nationwar_serverinfo.find(
			{ groupmark: gmark, isout: { $ne: 0 } },
			{
				areamark: 1,
				isout: 1,
				servid: 1,
				groupid: 1
			}).sort({ isout: -1 })
		if (result2.length > 0) {
			for (let i = 0; i < result2.length; i++) {
				// 查这个服下面的所有未领取结算奖励的玩家
				let userList = await global.dao.nationwar_battleinfo.find({ areamark: result2[i].areamark, finalreward_get: { $exists: 0 } }, { servid: 1, uid: 1 });
				await finalreward({ sid: result2[i].servid, list: userList, rank: i + 1, groupid: result2[i].groupid });
				console.error('NATIONWAR_FINISH_REWARD', result2[i].areamark, result2[i].servid, result2[i].isout, new Date().toLocaleString())
			}
		}

	}

	lastFlushTime = Date.now();
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
	return true;
}