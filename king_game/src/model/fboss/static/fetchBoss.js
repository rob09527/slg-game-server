
'use strict'

module.exports = exports = async function (bid) {
	let boss = await this.findOne({_id: bid});
	return boss;
}
