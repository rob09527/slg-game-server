
'use strict';

module.exports = exports = function () {
	const config = global.gameconfig.robotpvp.deepQueryOne('ID', this.robot);
	if (config) return config.ICON;
	return 10001;
}