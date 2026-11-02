
'use strict';

module.exports = exports = function (key, ...vals) {
	vals = vals.map(obj =>{
		obj = obj || '';
		return obj.toString();
	})
	let text = global.gameconfig.text[key] || key || '';
	for (let i = 0; ; i++){
		let regex = /\$\{\}/;
		let info = text.match(regex);
		if (!info) break;
		text = text.replace(regex, vals[i] || '');
	}
	return text;
}