
'use strict'

const _ = require('lodash');
const moment = require('moment');
const ms = require('ms');
const assert = require('assert');

exports.name = "国战-随机对战组随机分组";
// 定时器语句
exports.cron = '1 0 * * 6';

let lastFlushTime = 0;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {
	let servergroups = await global.dao.nationwar_serverinfo.find({ isout: 0, position: { $exists: 0 } }, { servid: 1 });
	if (servergroups && servergroups.length == 0) {
		console.error('NATIONWAR RANDOM NO DATA', new Date().toLocaleString());
		assert(servergroups && servergroups.length > 0, 'nationwar no data')
	}

	const getTimes = (num) => {
		let _num = num; // 服务器数量
		let today = moment().startOf('days').valueOf();
		let time;
		if (_num == 5) {
			// 周六晚上8点
			time = today + ms('20h') + ms('30m');
		} else if (_num == 4) {
			// 周一晚上8点
			let date = moment().isoWeekday(1).add(1, 'weeks').startOf('days').valueOf();
			time = date + ms('20h') + ms('30m');
		} else if (_num == 3) {
			// 周三晚上8点
			let date = moment().isoWeekday(3).add(1, 'weeks').startOf('days').valueOf();
			time = date + ms('20h') + ms('30m');
		}
		return time;
	}

	const config = global.gameconfig.join_nationwar_server || {};
	let count = 0;// 做小组计数
	for (let s in config) {
		// 所有分组服务器配置
		let _config = config[s];
		let _servers = await global.dao.nationwar_serverinfo.find({ isout: 0, position: { $exists: 0 }, servid: { $in: _config } }, { servid: 1 }).sort({ servid: 1 })
		// 按照5个服务器划分。最后一个服务器如果小于等于2。则不分组。
		let servers = _.chunk(_servers, 5);
		for (let i = 0; i < servers.length; i++) {
			// 判断长度等于5。
			if (servers[i].length <= 4) break;
			// 随机
			let shuffleServers = _.shuffle(servers[i]);
			let servids = []; // 存头部服务器下标
			for (let j = 0; j < shuffleServers.length; j++) {
				// 更新
				await global.dao.nationwar_serverinfo.updateOne({ servid: shuffleServers[j].servid }, {
					$set: {
						position: j,
						groupmark: `sys_${count}_${i}`
					}
				})
				servids.push(shuffleServers[j].servid);
			}
			// 判断打的轮次和时间
			let nexttime, round
			if (servids.length == 5) {
				round = 1;
			} else if (servids.length == 4) {
				round = 2
			} else if (servids.length == 3) {
				round = 3
			}
			nexttime = getTimes(servids.length);
			// 创建国战表
			if (servids.length > 0) {
				await global.dao.nationwar_match.create({
					groupmark: `sys_${count}_${i}`,
					servids,
					round,
					nexttime,
					nextroundtime: nexttime + ms('3m')
				})
			}
		}
		count++;
	}

	// 分组完过后 进行国战擂台初始化
	global.dao.ringrank.refresh().catch(console.error);
	lastFlushTime = Date.now();
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
	return true;
}