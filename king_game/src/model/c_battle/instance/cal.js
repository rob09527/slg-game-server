
'use strict'

const moment = require('moment');
const assert = require('assert');
const battlecal = require('./../common/bcal_scf');

module.exports = exports = async function () {
	assert(!this.finish, 'already finish');
	assert(typeof this.player === 'object', 'player chkfail');
	assert(typeof this.enemy === 'object', 'enemy chkfail');
	this.result = await battlecal(this.type, this.seed, this.player, this.enemy, this.season,this.lcards, this.rcards);
	// this.result.ret = 'win';
	this.finish = Date.now();
	await this.save();
	let now = moment().format('YYYY-MM-DD HH:mm:ss');
	return this;
}
