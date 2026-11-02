
'use strict'

module.exports = function (type) {
	return type.startsWith('BATCH') || type.startsWith('ONLY') || type.startsWith('LIMIT')
		|| type.startsWith('GUANYU') || type.startsWith('ZHAOYUN');
}