
'use strict'

module.exports = async function (legion) {
	let boss = await this.findOne({legion});
	if (!boss) {
		boss = await this.create({legion})
	}
	return boss;
}