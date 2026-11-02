
'use strict'

module.exports = exports = function (weights) {
	if (weights.length < 1) return -1;
	if (weights.length == 1) return 0;
	let total = 0;
	for (let w of weights){
		total += w;
	}
	if (total == 0) return Math.round(Math.random() * (weights.length - 1));
	let ran = Math.random() * total;
	let tmp = 0;
	for (let i = 0; i < weights.length; i++) {
		tmp += weights[i];
		if (ran < tmp) return i;
	}
	return -1;
}