
'use strict'

module.exports = exports = async function () {
	let tmp = this.toJSON();

	let team = [];
	for (const {rid, leader} of tmp.fellows) {
		let fellow;
		if (rid.startsWith('robot')) {
			delete tmp.robot;
			let robotid = rid.slice(6);
			let config = global.gameconfig.robotpvp.deepQueryOne('ID', parseInt(robotid));
			if (!config) continue;
			fellow = {
				rid,
				leader,
				rname: config.NAME,
				power: config.POWER,
				level: config.LV,
				iconid: config.ICON,
				frameid: 10003,
			}
		}else{
			const role = await this.db.models.role.findOne({_id: rid});
			if (!role) continue;
			fellow = {
				rid,
				leader,
				rname: role.name,
				power: role._power,
				level: role.level,
				iconid: role.iconid,
				frameid: role.frameid,
				headid: role.headid
			}
		}
		team.push(fellow);
	}
	if (tmp.ready) {
		tmp.competition = {
			stamina: this.getSta(),
		}
	}
	tmp.id = tmp._id;
	tmp.team = team;
	delete tmp.ready;
	delete tmp.last;
	delete tmp._sta;
	delete tmp._id;
	delete tmp.__v;
	delete tmp.fellows;
	return tmp;
}