
'use strict'

const debug = require('debug')('kaihei:launcher:' + require('./util/debug_extend')(__filename));

const fs = require('fs');
const path = require('path');

let instance;

class GameConfig {

	constructor(dir, rewrite, env) {
		this.dir = path.resolve(__dirname, dir); // 相对路径会出现 dev 启动和正式启动会出现不一致的路径问题(因为正式启动入口不在根目录下
		this.rewrite = rewrite;
		this.reload(env);
	}

	reload(env) {
		let self = this;

		let exists = fs.existsSync(self.dir);
		if (!exists) return;

		let configs = fs.readdirSync(self.dir).filter(function (_) {
			return _.endsWith('.json') || _.endsWith('.json5');
		})
		for (var config of configs){		
			let _default = path.resolve(self.dir, config);
			try{
				let data = fs.readFileSync(_default);
				data = JSON.parse(data);
				/*
					重载环境配置
				 */
				if (env && env.length > 0) {
					let _env_config = config.split('.');
					_env_config.pop();
					_env_config.push(...[env, 'json']);
					_env_config = _env_config.join('.');	
					_env_config = path.resolve(self.dir, _env_config);
					if (fs.existsSync(_env_config)) {
						try {
							let _env_data = fs.readFileSync(_env_config);
							_env_data = JSON.parse(_env_data);
							data = _env_data;
						}catch(e){
							console.error(e);
						}
					}
				}
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
	return new GameConfig(dir, rewrite);
};
