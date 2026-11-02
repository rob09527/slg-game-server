
'use strict';

const cond = {
	_maxmapid: {
		$gt: 0,
	},
};
const sort = {
	_maxmapid: -1,
}
const select = {
	_maxmapid: 1,
	rno: 1, rname: 1, hide: 1,
	iconid: 1, frameid: 1, _power: 1,
};

module.exports = exports = async _ => {
	let list = await global.dao.role.find(cond, select).sort({_maxmapid: -1, chaperupdate: 1}).limit(500);
	let cache = list.slice(0, 50).map(role =>{
		let info = role.avatarInfo();
		return {
			maxmapid: role.maxmapid,
			...info
		}
	})
	list = list.map(role => role.i());
	return {list, cache};
}