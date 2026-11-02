
'use strict'

const cond = {
	'dgtop.chapter': {$exists: 1}
}
const sort = {
	'dgtop.chapter': -1,
	'dgtop.node': -1,
	'dgtop.update': 1,
}
const select = {
	dgtop: 1,
	rno: 1, rname: 1, hide: 1,
	iconid: 1, frameid: 1, _power: 1,
};	// todo

module.exports = exports = async _ => {
	let list = await global.dao.role.find(cond, select).sort(sort).limit(500);
	let cache = list.slice(0, 50).map(role =>{
		return {
			rid: role.i(),
			rname: role.name,
			power: role._power,
			level: role.level,
			iconid: role.iconid,
			frameid: role.frameid,
			headid:role.headid,
			chapter: role.dgtop.chapter,
			node: role.dgtop.node,
		}
	})
	list = list.map(role => role.i());
	return {list, cache};
}