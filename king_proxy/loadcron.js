
'use strict'

const debug = require('debug')('kaihei:schedule');

const assert = require('assert');

const path = require('path');

const cron = require('node-schedule').scheduleJob;

const {promisify} = require('util');

let {readdir,existsSync} = require('fs');

readdir = promisify(readdir);

module.exports = exports = function (dir) {
	if (!existsSync(dir) ) {
		return ;
	}
	return readdir(dir)
	.then(files =>{
		files = files.filter(function (file) {
			return file.endsWith('.js');
		})
		for (let file of files){
			file = path.resolve(dir, file);
			const task = require(file);
			assert(typeof task.cron === 'string' && typeof task.fn === 'function', 'invalid task '+file);
			cron(task.cron, task.fn);
			debug(file, task.cron);
		}
	});
}
