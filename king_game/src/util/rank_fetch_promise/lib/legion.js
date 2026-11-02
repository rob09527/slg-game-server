
'use strict'

module.exports = exports = async _ => {
	let cache = await global.dao.legion.find().sort({power: -1});
	cache = cache.map(legion =>{
		return {
			id: legion._id.toString(),
			name: legion.name,
			level: legion.level,
			power: legion.power,
		}
	})
	return {cache};
}