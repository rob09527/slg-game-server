
'use strict'

const SELECT = {
	rno: 1, rname: 1, 'hide.38001': 1,
	iconid: 1, frameid: 1, _power: 1,headid:1,
	frameid:1,
	pvpmultiscore: 1,
}

module.exports = exports = async _ => {
	let cond = {
		pvpmultiscore: {$exists: 1},
	}
	let list = await global.dao.role.find(cond, '_id').sort({pvpmultiscore: -1}).limit(500);
	list = list.map(({_id}) => _id.toString());
	let cache = list.slice(0, 50).map(async _id =>{
		let role = await global.dao.role.findOne({_id}, SELECT);
		return {
			rid: role.i(),
			rname: role.name,
			iconid: role.iconid,
			frameid: role.frameid,
			headid:role.headid,
			power: role._power,
			level: role.level,
			score: role.pvpscore,
		}
	});
	cache = await Promise.all(cache);
	return {list, cache};
}