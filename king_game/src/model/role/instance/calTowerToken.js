/*
	计算试炼令恢复数量
*/

'use strict'

const {
	MAX_TOKEN_NUM,
	REF_INTERVAL_MIN,
} = global.gameconfig.others.TOWER;

const REF_INTERVAL = REF_INTERVAL_MIN * 60 * 1000;

module.exports = exports = function () {
	let del = Date.now() - this._towertoken.last;
	let num = Math.trunc(del / REF_INTERVAL);
	this._towertoken.last += num * REF_INTERVAL;
	this._towertoken.num += num;
	this._towertoken.num = Math.min(MAX_TOKEN_NUM, this._towertoken.num);
}