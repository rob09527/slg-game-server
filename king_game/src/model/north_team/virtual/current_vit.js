
'use strict';
const { CONFIG = {PER_HOUR: 6, CAST_VIT: 1, MAX_VIT: 10} } = global.gameconfig.north_fight;

const HOUR_T = 60 * 60 * 1000 * CONFIG.PER_HOUR;
/*
* 当前体力
* */
module.exports = function () {

	const TIME_DIFF = Date.now() - this.lastVitTime;
	const m = TIME_DIFF / HOUR_T ;
	const t = Math.floor(m);
	if (!t){
		return this.vit;
	}

	this.vit += t;
	this.vit = Math.min(this.vit ,CONFIG.MAX_VIT );
	this.lastVitTime = Date.now() - ( TIME_DIFF % HOUR_T) ;
	return this.vit;
}
