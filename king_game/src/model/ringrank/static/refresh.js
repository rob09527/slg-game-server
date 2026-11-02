
'use strict'

// 刷新国战擂台，定时器调用

const moment = require('moment');

const {CONFIG, ROBOT} = global.gameconfig.ring_rank;

/**
 *
 */
module.exports = exports = async function () {

	console.error("NATION RING START", moment().format("YYYY-MM-DD HH:mm:ss"));
	const marks = await global.dao.nationwar_serverinfo.findMarks();
	if (!marks || marks.length <= 0) { // 没有有效国战跨服组，直接返回,也就本期不开
		console.warn("NATION RING NO GROUPMARK", marks)
		return;
	}
	console.warn("NATION RING GROUPMARK", marks)
	const r = await global.dao.ringrank.deleteMany({}); // 删除上一期的擂台数据
	console.error("NATION RING DELETE RANK", r, moment().format("YYYY-MM-DD HH:mm:ss"));
	for (const markname of marks) {
		const ROBOTS = Object.keys(ROBOT).map((id, index) => {
			const info = ROBOT[id];
			return {
				robot_id: id,
				rank: index +1,
				groupmark: markname,
				rid: id,
				role: {
					...info.ROLE,
					servid: info.ROLE.servid || 9000
				}
			}
		});
		// 需要洗牌开启下面逻辑即可
		// ROBOTS.shuffle();
		// ROBOTS.forEach((item, index)=> item.rank = index + 1);
		// 添加机器人
		const r = await global.dao.ringrank.create(ROBOTS);
		// 初始化排名序号
		await global.dao.counter.init("ringrank" + markname, r.length);
	}
	console.error("NATION RING FINISHED", moment().format("YYYY-MM-DD HH:mm:ss"));
	return "OK";
}
