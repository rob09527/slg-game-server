
'use strict'

module.exports = exports = function () {
	let _arr = Object.keys(global.gameconfig.dgnodetemplate);
	_arr.shuffle();
	return _arr.map(str =>{
		return Number.parseInt(str);
	})
}