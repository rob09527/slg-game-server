
'use strict'

const assert = require('assert');

module.exports = exports = function () {
	let config = global.gameconfig.general[this.gsid];
	if (!config) return;
	return {
		guid: this.guid(),
		gsid: this.gsid,
		level: this.level,
		class: this.class,
		star: config.STAR,
		camp: config.CAMP,
		occu: config.OCCU,
		skin:this.skin
	}
}