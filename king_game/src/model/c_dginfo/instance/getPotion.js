
'use strict'

module.exports = exports = function () {
	let potion = [];
	for (let [id, count] of Object.entries(this.potion)) {
		potion.push({id, count});
	}
	return potion;
}