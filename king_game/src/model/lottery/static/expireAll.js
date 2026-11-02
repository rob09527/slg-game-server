
'use strict'

module.exports = async function () {
	let cond = {
		expire: {$exists: 0},
	}
	let $set = {
		expire: Date.now(),
	}
	await this.updateMany(cond, {$set});
}