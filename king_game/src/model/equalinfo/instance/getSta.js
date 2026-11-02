
'use strict'

const {
	MAXSTA,
	STAINTERVALMIN,	// 恢复间隔(分钟)
} = global.gameconfig.others.PVPEQUAL;

const INTERVAL = STAINTERVALMIN * 60 * 1000;

module.exports = exports = function () {
	let recover = Math.trunc((Date.now() - this._sta.last) / INTERVAL);
	if (recover > 0 && this._sta.val > 0) {
		this._sta.val -= recover;
		this._sta.val = Math.max(this._sta.val, 0);
		this._sta.last += recover * INTERVAL;
		this.markModified('_sta');
	}
	return MAXSTA - this._sta.val;
}