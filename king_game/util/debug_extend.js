
'use strict'

module.exports = exports = (filename, ext) =>{
	return require('path').basename(filename, ext || '.js');
}