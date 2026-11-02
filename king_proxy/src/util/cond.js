
'use strict';

function _chk_conf(key, num, general) {
	num = parseInt(num);
	const config = global.gameconfig.general[general.gsid];
	if (!config) return false;
	return config[key] == num;
}

let _chk_star = _chk_conf.bind(null, 'STAR');
let _chk_camp = _chk_conf.bind(null, 'CAMP');
let _chk_occu = _chk_conf.bind(null, 'OCCU');

module.exports = exports = {
	'1001': _chk_star.bind(null, 1),
	'1002': _chk_star.bind(null, 2),
	'1003': _chk_star.bind(null, 3),
	'1004': _chk_star.bind(null, 4),
	'1005': _chk_star.bind(null, 5),
	'1006': _chk_star.bind(null, 6),
	'1007': _chk_star.bind(null, 7),
	'1008': _chk_star.bind(null, 8),
	'1009': _chk_star.bind(null, 9),
	'1010': _chk_star.bind(null, 10),
	'1011': _chk_star.bind(null, 11),
	'1012': _chk_star.bind(null, 12),
	'1013': _chk_star.bind(null, 13),

	'2001': _chk_camp.bind(null, 1),
	'2002': _chk_camp.bind(null, 2),
	'2003': _chk_camp.bind(null, 3),
	'2004': _chk_camp.bind(null, 4),
	'2005': _chk_camp.bind(null, 5),
	'2006': _chk_camp.bind(null, 6),

	'3001': _chk_occu.bind(null, 1),
	'3002': _chk_occu.bind(null, 2),
	'3003': _chk_occu.bind(null, 3),
	'3004': _chk_occu.bind(null, 4),
	'3005': _chk_occu.bind(null, 5),
}

