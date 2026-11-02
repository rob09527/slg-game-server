
'use strict'

const default_select = {
	rno: 1, rname: 1, hide: 1,
	frameid: 1, _power: 1, headid: 1,
};

module.exports = exports = async camp => {
	let key = `campscore.${camp}`;
	let select = {
		[key]: 1,
		...default_select
	}
	let cond = {
		[`${key}.num`]: {
			$gt: 0,
		},
	}
	let sort = {
		[`${key}.num`]: -1,
		[`${key}.update`]: 1,
	}
	let list = await global.dao.role.find(cond, select).sort(sort).limit(500);
	let cache = list.slice(0, 50).map(role =>{
		let info = role.avatarInfo();
		return {
			score: role.get(key).num,
			...info
		}
	})
	list = list.map(role => role.i());
	return {list, cache};
}