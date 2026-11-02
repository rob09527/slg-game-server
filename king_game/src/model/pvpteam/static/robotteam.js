
'use strict'

module.exports = exports = function (index = 0) {
	index = Number.parseInt(index);
	let config = global.gameconfig.robotteam[index];
	if (!config) return;
	let team = [];
	let total_power = 0;
	let set_leader = false;
	for (let robotid of config.ROBOTS) {
		let robot = global.gameconfig.robotpvp.deepQueryOne('ID', robotid);
		if (!robot) continue;
		let {
			ICON: iconid,
			FRAME: frameid = 10003,
			LV: level,
			NAME: rname,
			POWER: power,
		} = robot;
		total_power += power;
		team.push({
			robot: 1,
			leader: set_leader? 0: 1,
			rid: 'robot_' + robotid,
			iconid,
			frameid,
			level,
			rname,
			power,
		})
	}
	return {
		pneed: 10,
		power: total_power,
		name: config.NAME,
		teamno: 94000 + index,
		team,
		competition: {
			teamscore: 1000,
		},
	}
}