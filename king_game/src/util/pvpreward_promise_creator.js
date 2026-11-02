
'use strict'

const textgetter = require('./../util/textgetter');
const ObjectId = require("mongoose").Types.ObjectId;
const _ = require('lodash');
const LIMIT_EACH_QUERY = 1000;


module.exports = exports = async function () {
	const daily = 'daily';
	const season = 'season';
	const dailyConfig = global.gameconfig['pvpreward' + daily];
	const seasonConfig = global.gameconfig['pvpreward' + season];
	const NOW = new Date();
	const IS_SEASON = NOW.getDay() === 4; // 周4结算赛季
	console.error('SCHEDULEREF pvprewarddaily', NOW.toLocaleString());
	if (IS_SEASON) {
		// 清空上个赛季的记录
		await global.dao.wangpvp.deleteMany({});
		await global.dao.wangpvprecord.deleteMany({});
		await global.dao.video.deleteMany({ type: "wangpvp" });
		// 清空竞猜记录
		await global.dao.wangpvpguess.deleteMany({});
		console.error('SCHEDULEREF pvprewardseason', NOW.toLocaleString());
	}
	if (!dailyConfig) throw new Error('invalid cycle');
	let mails = [];
	let wangpvps = [];
	let topkingpvps = []; // 巅峰赛参赛玩家-单人演武赛季结算的前30名
	let skip_num = 0;
	const createMail = (role_rank, role, config, cycle) => {
		for (const info of config) {
			if (info.MAX <= role_rank) continue;
			mails.push({
				rid: role._id, type: 2, reward: info.ITEMS,
				title: textgetter('PVPREWARD_TITLE_' + cycle.toUpperCase()),
				content: textgetter('PVPREWARD_CONTENT_' + cycle.toUpperCase(), role_rank + 1),
			})
			break;
		}
	}
	const wangpvp_users_fetch = (role_rank, role, groupid) => {
		let obj = {
			rid: role._id,
			mark: role_rank,
			groupid
		};
		wangpvps.push(obj);
		mails.push({
			rid: role._id,
			title: textgetter('WANGPVP_OPENT'),
			content: textgetter('WANGPVP_OPENC'),
		})
	}
	//  查玩家需要按照服务器分组id
	const serv_groups = await global.dao.gameserver.fetchServers();
	for (let group of serv_groups) {
		let servers = group.servers;
		mails = [];
		wangpvps = [];
		skip_num = 0;
		console.log(`PVP REWARD START GROUPID ${group._id}`, new Date().toLocaleString())
		console.time(`PVP REWARD GROUPID ${group._id}`);

		let roles = await global.dao.role.find({ servid: { $in: servers }, 'battlearr.pvpdef': { $exists: true } }, { rname: 1, pvpscore: 1, servid: 1, uid: 1 }).sort({ pvpscore: -1 }).limit(LIMIT_EACH_QUERY);
		if (roles.length < 1) continue;
		for (let i = 0; i < roles.length; i++) {
			const role = roles[i];
			let role_rank = skip_num + i;
			createMail(role_rank, role, dailyConfig, daily);
			if (IS_SEASON) {
				createMail(role_rank, role, seasonConfig, season);
				// 筛选出64位参加王战的玩家
				if (role_rank < 64) {
					wangpvp_users_fetch(role_rank, role, group._id);
					if (role_rank < 30) {
						// 保存参加巅峰赛赛的玩家
						topkingpvps.push({ uid: role.uid, servid: role.servid })
					}

				}
			}
		}
		await global.dao.mail.insertMany(mails);
		console.log(`PVP REWARD END GROUPID ${group._id}`, new Date().toLocaleString())
		console.timeEnd(`PVP REWARD GROUPID ${group._id}`);
		// 插入王战的玩家
		if (wangpvps.length > 0) {
			//  check wangpvp num
			let needNum = 64 - wangpvps.length;

			if (needNum != 0) {
				let rids = wangpvps.map(data => ObjectId(data.rid));
				// 查出所需的数据
				// 按照服务器分组id查
				let userlist = await global.dao.role.find({ servid: { $in: servers }, _id: { $nin: rids }, 'battlearr.normal': { $exists: true } }, { rname: 1, uid: 1 }).sort({ 'others.90185.count': -1 }).limit(100);
				let num = wangpvps.length;
				for (let i = 0; i < userlist.length; i++) {
					let obj = {
						rid: userlist[i]._id,
						mark: i + num,
						groupid: group._id
					};
					if (wangpvps.length >= 64) break;
					wangpvps.push(obj);
				}
				if (wangpvps.length > 64) {
					console.log('pvp wangpvp num', wangpvps.length, new Date().toLocaleString());
					wangpvps = _.take(wangpvps, 64);
				}
			}
			await global.dao.wangpvp.insertMany(wangpvps);
		}
	}

	let current = Date.now();
	console.log('pvp reward', daily, mails.length, current);
	if (IS_SEASON) {
		let upd1 = {
			$set: { pvpscore: 1000, pvpupdate: current }
		}
		console.log('pvp reward', season, mails.length, current);
		await global.dao.role.updateMany({ 'pvpscore': { $ne: 1000 } }, upd1);
		// 插入巅峰赛分组
		if (topkingpvps.length > 0) await global.dao.topking.insertMany(topkingpvps)
		// 清空排行榜
		await global.services.RankService.clearPatten('pvp', '*');
	}
}
