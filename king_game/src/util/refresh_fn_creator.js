
'use strict'

const from_config = require('./refresh_fn_from_config');

module.exports = exports = function (cycle){
	const config = global.gameconfig['refresh'+cycle];
	return from_config(config, cycle);
}