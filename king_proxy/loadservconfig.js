
'use strict'

const debug = require('debug')('kaihei:launcher:' + require('./util/debug_extend')(__filename));

const {existsSync} = require('fs');
const path = require('path');

let instance;

class ServConfig {

	constructor(config_path, rewrite) {
		this.config_path = path.resolve(config_path);
		this.reload();
	}

	reload() {
		function _load(path) {
			let config = {};
			if (existsSync(path)) {
				config = require(path);
				if (config.IMPORT) {
					let im = _load(config.IMPORT);
					for (let k in im){
						config[k] = im[k];
					}
					delete config.IMPORT;
				}
			}
			return config;
		}
		const tmp = _load(this.config_path);
		for (let key in tmp){
			this[key] = tmp[key];
		}
	}
}

module.exports = exports = function (config_path) {
	return new ServConfig(config_path);;
};