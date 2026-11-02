
'use strict'

module.exports = exports = function (rate, w) {
	rate = parseInt(rate);
	w = parseInt(w) || 100;
	if (!rate) return false;
	if (rate >= w) return true;
	return rate > Math.random() * w;
}