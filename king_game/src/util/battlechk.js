
'use strict'

const {promisify} = require('util');
const exec = promisify(require('child_process').execFile);

module.exports = exports = function (...args) {
	args = ['index.js', global.config.GAMECONFIG].append(args);
	return exec('node', args, {cwd: global.config.BATTLELOGIC});
}