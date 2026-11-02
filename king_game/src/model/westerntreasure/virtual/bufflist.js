
'use strict'

// 守卫 buff
module.exports = exports = function () {
	let buff = this.buff || []
	let result = {}
	const { RANDOM_BUFF } = global.gameconfig.western_treasure
	for (const { id } of buff) {
		const item = RANDOM_BUFF.find(({ BUFFID }) => BUFFID == id)
		if (!item) continue
		const { ATTR, VAL } = item
		let a = ATTR.toLowerCase()
		result[a] = result[a] || 0
		result[a] += VAL
	}
	return result
}