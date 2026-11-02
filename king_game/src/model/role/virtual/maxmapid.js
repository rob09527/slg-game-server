
'use strict';

const assert = require('assert');

module.exports = exports = function () {
	const chapterid = parseInt(global.gameconfig.maplist[this._maxmapid]) || -1;
	return chapterid;
}