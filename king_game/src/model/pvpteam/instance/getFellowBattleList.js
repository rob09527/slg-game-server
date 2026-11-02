
'use strict'

const assert = require('assert');

module.exports = exports = async function () {
	let list = [];
	for (let {rid: _id} of this.fellows) {
		let role = await this.db.models.role.findOne({_id});
		assert(role, 'fellow nexist');
		let zbskill = await this.db.models.zbdepot.getAllZbSkill({rid: _id})
		list.push({
			zbskill,
			info: {
				servid: role.servid,
				rname: role.name,
				level: role.level,
				iconid: role.iconid,
				headid: role.headid,
				frameid: role.frameid
			},
			'set': await role.getBattleSet('teampvp'),
		})
	}
	return list;
}