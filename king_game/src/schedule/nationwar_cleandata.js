
'use strict'

exports.name = "国战-清理国战信息";
// 定时器语句
exports.cron = '30 18 * * 5';

exports.force_on_time = true; //强制锁定

let lastFlushTime = 0;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {
	// 国战对阵信息
	await global.dao.nationwar_match.deleteMany({});
	// 清理服务器信息
	await global.dao.nationwar_serverinfo.deleteMany({});
	// 入驻信息清理
	await global.dao.nationwar_battleinfo.deleteMany({})
	// 清理战报
	await global.dao.nationwar_record.deleteMany({});
	// 清理擂台挑战历史
	await global.dao.ringhistory.deleteMany({})
	lastFlushTime = Date.now();
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
	return true;
}