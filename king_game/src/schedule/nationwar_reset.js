
'use strict'
exports.name = "国战-重置挑战信息";
// 定时器语句
exports.cron = '58 23 * * 6,1,3';

exports.force_on_time = true; //强制锁定

let lastFlushTime = 0;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {
	const {
		MAXHP = 10000
	} = global.gameconfig.nationwar.SCORE;
	// 阵营站位清理
	let areamarks = await global.dao.nationwar_serverinfo.find({ isout: 0 }, { areamark: 1 });
	if (areamarks && areamarks.length == 0) {
		console.error('NATIONWAR RESET NO DATA >> ', new Date().toLocaleString());
		return
	}
	// 变更战斗结束的state和round
	let nationwarInfo = await global.dao.nationwar_match.findOne({ state: 3 }, { round: 1, state: 1 });
	if (nationwarInfo && nationwarInfo.state == 3) {
		await global.dao.nationwar_match.updateMany({ state: 3 }, { $set: { round: nationwarInfo.round + 1, state: 1 } });
	} else {
		console.error('NATIONWAR RESET NO IN THIS TIME >> ', new Date().toLocaleString());
		return
	}

	let marks = areamarks.map(data => data.areamark);
	// 入驻信息清理
	await global.dao.nationwar_serverinfo.updateMany({ areamark: { $in: marks } }, {
		$set:
		{
			front: { left: [], right: [], leftindex: 0, rightindex: 0 },
			back: { left: [], right: [], leftindex: 0, rightindex: 0 },
			infield: { front: { left: [], right: [] }, back: { left: [], right: [] } },
			pre: [],
			nowhp: MAXHP,
			maxhp: MAXHP
		}
	});
	// 取到未淘汰的玩家 去取阵容
	await global.dao.nationwar_battleinfo.updateMany({ areamark: { $in: marks } },
		{
			$set: {
				c_battleset: {},
				c_battlesetpower: {},
				c_battlesetstate: {},
				c_settlement: {},
				killcount: 0,
				g_cache: {},
				score: 0
			},
			$unset: {
				score_finish: 1
			}
		})

	// 清除已经淘汰玩家的入驻信息
	await global.dao.nationwar_battleinfo.updateMany({ areamark: { $nin: marks }, c_battlesetstate: { $exists: 1 } },
		{
			$set: {
				c_settlement: {}
			}
		})

	// 清理战报
	await global.dao.nationwar_record.deleteMany({});

	lastFlushTime = Date.now();
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
	return true;
}