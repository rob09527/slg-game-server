
'use strict'

const debug = require('debug')('kaihei:launcher:' + require('./util/debug_extend')(__filename));

const fs = require('fs');
const path = require('path');

let instance;

class GameConfig {

	constructor(dir, rewrite) {
		this.dir = path.resolve(dir);
		this.rewrite = rewrite;
		this.reload();
	}

	reload() {
		let self = this;

		let exists = fs.existsSync(self.dir);
		if (!exists) return;

		let configs = fs.readdirSync(self.dir).filter(function (_) {
			return _.endsWith('.json') || _.endsWith('.json5');
		}).map(function (_) {
			return path.resolve(self.dir, _);
		})
		for (var config of configs){
			try{
				let data = fs.readFileSync(config);
				data = JSON.parse(data);
				self[path.parse(config).name] = data;
			}catch(e){
				console.error(e.message, config);
			}
		}
		for (let configname in self.rewrite){
			if (!this[configname]) continue;
			let config = self.rewrite[configname];
			for (let key in config){
				let val = config[key];
				this[configname][key] = val;
			}
		}
	}
}

module.exports = exports = function (dir, rewrite) {
	return new GameConfig(dir, rewrite);;
};