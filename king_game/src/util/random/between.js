
'use strict'

module.exports = exports = function (min, max, rate) {
	min = parseInt(min);
	max = parseInt(max);
	rate = parseInt(rate) || 1;
	if (min == max) return min;
	min = min * rate;
	max = max * rate;
	let choices = max - min + 1;
	return Math.floor(Math.random() * choices + min) / rate;
}