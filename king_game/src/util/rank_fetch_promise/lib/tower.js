
'use strict'

const SELECT = {
	rno: 1, rname: 1, 'hide.38001': 1,
	iconid: 1, frameid: 1, _power: 1,headid:1,
	tower: 1,
}

module.exports = exports = async _ => {
	let recordlist = await global.dao.tower
		.find({type: 'tower'}, {_id: 0, rid: 1, topfloor: 1})
		.sort({topfloor: -1, topfloortime: 1})
		.limit(500)
	let list = recordlist.map(({rid}) => rid);
	let cache = recordlist.slice(0, 50).map(async ({rid, topfloor}) =>{
		let role = await global.dao.role.findOne({_id: rid}, SELECT);
		// 做非空判断
		if (!role)return null;
		return {
			rid: role.i(),
			rname: role.name,
			iconid: role.iconid,
			headid:role.headid,
			frameid: role.frameid,
			power: role._power,
			level: role.level,
			tower: topfloor,
		}
	}).filter(item => item);
	cache = await Promise.all(cache);
	return {list, cache};
}