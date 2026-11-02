'use strict'

// 定时器
exports.name = "组队演武数据清理";
//组队演武周二0000后数据清理

// 定时器语句
exports.cron = "30 1 0 * * 5";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
	await global.dao.pvpteam.remove({});
	// 清空玩家身上组队阵容
	let udp = {
		$unset: {
			'battlearr.teampvp': 1,
			'teamid': 1
		}
	}

	await global.dao.role.updateMany({}, udp);
	await global.dao.video.deleteMany({ type: 'teampvp' })
	// 清理所有组队的申请记录
	await global.dao.apply.deleteMany({ type: "teampvp" })
	// 清空排行榜数据
	await global.services.RankService.clearPatten('pvpteam', '*');
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
	return true;
}
